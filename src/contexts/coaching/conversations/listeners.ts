import { Socket } from 'socket.io';
import fs, { WriteStream } from 'fs';
import { Writable } from 'stream';
import { Bucket, Storage } from '@google-cloud/storage';
import speech, { protos, v1p1beta1 } from '@google-cloud/speech';
import { SocketListener, firestoreDb } from '../../../framework';
import { StreamingRecognitionConfig, StreamingRecognizeResponse } from './types';
import { getParagraphs } from './domain/conversation';

const COLLECTION_NAME = 'conversations';

const storage = new Storage();
const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET!);

const client = new speech.SpeechClient();

const request: StreamingRecognitionConfig = {
  config: {
    enableWordTimeOffsets: true,
    encoding: 'WEBM_OPUS',
    sampleRateHertz: 48000,
    languageCode: 'en-US',
    enableAutomaticPunctuation: true,
    // https://cloud.google.com/speech-to-text/docs/multiple-voices
    // enableSpeakerDiarization: true,
  },
  interimResults: true, // Enable interim results for real-time transcription
  singleUtterance: false, // Do not stop after the first utterance
};

interface NewConversationPayload {
  userId: string;
  conversationUuid: string;
  data: ArrayBuffer;
}

interface StreamSession {
  fileStream: Writable;
  recognizeStream: Writable;
  conversationId: string;
}

const streamSessions: Map<string, StreamSession> = new Map();
let resultArray: any[] = [];

const newConversationStartedHandler: SocketListener = {
  event: 'new-conversation-started',
  callback: async (socket: Socket, payload: Omit<NewConversationPayload, 'data'>) => {
    console.log('new-conversation-started');
    console.log(JSON.stringify(resultArray));

    const { userId, conversationUuid } = payload;

    const pathFile = `users/${userId}/audios/${conversationUuid}.webm`;
    const file = bucket.file(pathFile);
    const fileStream = file.createWriteStream();

    const conversationRef = await firestoreDb.collection(COLLECTION_NAME).add({
      userId,
      uuid: conversationUuid,
      userLabels: [],
      paragraphs: [],
      createdAt: new Date(),
    });

    const { id: conversationId } = conversationRef;

    socket.emit('conversation-id-assigned', { conversationUuid, id: conversationId });

    const recognizeStream = client
      .streamingRecognize(request)
      .on('error', console.error)
      .on('data', async (data: StreamingRecognizeResponse) => {
        console.log('on streamingRecognize data');
        // resultArray.push(data);
        // console.log(JSON.stringify(resultArray));

        const result = data.results[0];
        const { isFinal, alternatives } = result;

        if (alternatives) {
          const { transcript } = alternatives[0];
          console.log('transcript:', transcript);
          socket.emit('incoming-message-transcripted', { conversationUuid, incomingMessage: transcript });
        }

        if (alternatives && isFinal) {
          console.log('isFinal:', isFinal);
          const { transcript } = alternatives[0];
          console.log('transcript:', transcript);
          // fs.writeFileSync(`./data/${conversationUuid}.json`, JSON.stringify(resultArray, null, 2));

          // get paragraphs from result
          const paragraphs = getParagraphs(alternatives[0]);

          // emit new paragraphs to client
          socket.emit('paragraphs-transcripted', { conversationUuid, paragraphs });

          // save paragraphs to database
          await firestoreDb.runTransaction(async (transaction) => {
            // const conversationRef = firestoreDb.collection(COLLECTION_NAME).doc(conversationId);
            const conversation = await transaction.get(conversationRef);
            const { paragraphs: oldParagraphs } = conversation.data()!;

            const newParagraphs = [...oldParagraphs, ...paragraphs];

            transaction.update(conversationRef, { paragraphs: newParagraphs });
          });
        }

        /* if (result.isFinal) {
          // save resultArray as json file at ./data/resultArray.json
          // with indent 2
          fs.writeFileSync(`./data/${conversationUuid}.json`, JSON.stringify(resultArray, null, 2));

          const transcript = result.alternatives![0].transcript;
          // console.log(`Final transcript: ${transcript}`);
        } else {
          const interimTranscript = result.alternatives![0].transcript;
          // console.log(`Interim transcript: ${interimTranscript}`);
          // socket.emit('transcript', interimTranscript);
        } */
      });

    const streamSession = {
      fileStream,
      recognizeStream,
      conversationId,
    };

    streamSessions.set(conversationUuid, streamSession);
  },
};

const newConversationInProgressHandler: SocketListener = {
  event: 'new-conversation-in-progress',
  callback: (socket: Socket, payload: NewConversationPayload) => {
    console.log('new-conversation-in-progress');
    // console.log(JSON.stringify(resultArray));

    const { userId, conversationUuid, data } = payload;
    console.log('data:', data);

    const streamSession = streamSessions.get(conversationUuid);

    if (!streamSession) {
      return;
    }

    const { fileStream, recognizeStream } = streamSession;

    const buffer = Buffer.from(data);

    fileStream.write(buffer);
    recognizeStream.write(data);

    streamSessions.set(conversationUuid, { ...streamSession, fileStream, recognizeStream });
  },
};

const newConversationStoppedHandler: SocketListener = {
  event: 'new-conversation-stopped',
  callback: (socket: Socket, payload: Omit<NewConversationPayload, 'data'>) => {
    console.log('new-conversation-stopped');
    const { userId, conversationUuid } = payload;

    const streamSession = streamSessions.get(conversationUuid);

    if (!streamSession) {
      return;
    }

    const { fileStream, recognizeStream } = streamSession;

    fileStream.end();
    recognizeStream.end();

    streamSessions.delete(conversationUuid);

    resultArray = [];
  },
};

const listeners: SocketListener[] = [
  newConversationStartedHandler,
  newConversationInProgressHandler,
  newConversationStoppedHandler,
];

export default listeners;
