import { Socket } from 'socket.io';
import fs, { WriteStream } from 'fs';
import { Writable } from 'stream';
import { Bucket, Storage } from '@google-cloud/storage';
import speech, { protos, v1p1beta1 } from '@google-cloud/speech';
import { SocketListener, firestoreDb } from '../../../framework';
import { StreamingRecognitionConfig, StreamingRecognizeResponse } from './types';
import { getParagraphs } from './domain/conversation';

const COLLECTION_NAME = 'conversations';
const RECOGNIZE_STREAM_TIME_LIMIT = 0.5; // in minutes

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
  recognizeStreamTimeLimit: Date;
  conversationId: string;
}

const streamSessions: Map<string, StreamSession> = new Map();

function handleRecognizeStreamData(socket: Socket, conversationUuid: string) {
  console.log('handleRecognizeStreamData');
  console.log('conversationUuid', conversationUuid);
  console.log('socket', socket);

  return async function (data: StreamingRecognizeResponse) {
    console.log('on streamingRecognize data');

    const result = data.results[0];
    const { isFinal, alternatives } = result;

    if (alternatives) {
      const { transcript } = alternatives[0];

      socket.emit('incoming-message-transcripted', { conversationUuid, incomingMessage: transcript });
    }

    if (alternatives && isFinal) {
      const paragraphs = getParagraphs(alternatives[0]);

      socket.emit('paragraphs-transcripted', { conversationUuid, paragraphs });
    }
  };
}

function buildRecognizeStream(socket: Socket, conversationUuid: string) {
  const recognizeStream = client
    .streamingRecognize(request)
    .on('error', console.error)
    .on('data', handleRecognizeStreamData(socket, conversationUuid));

  return recognizeStream;
}

const newConversationStartedHandler: SocketListener = {
  event: 'new-conversation-started',
  callback: async (socket: Socket, payload: Omit<NewConversationPayload, 'data'>) => {
    console.log('new-conversation-started');

    const { userId, conversationUuid } = payload;

    const conversationRef = await firestoreDb.collection(COLLECTION_NAME).add({
      userId,
      uuid: conversationUuid,
      userLabels: [],
      paragraphs: [],
      createdAt: new Date(),
    });

    const { id: conversationId } = conversationRef;

    const pathFile = `audios/${userId}/${conversationId}.webm`;
    const file = bucket.file(pathFile);
    // await file.makePublic();
    const fileStream = file.createWriteStream();
    fileStream.on('finish', () => {
      console.log(`File ${pathFile} uploaded.`);

      socket.emit('conversation-audio-uploaded', { conversationUuid, id: conversationId });
    });

    socket.emit('conversation-id-assigned', { conversationUuid, id: conversationId });

    const recognizeStream = buildRecognizeStream(socket, conversationUuid);

    const streamSession = {
      fileStream,
      recognizeStream,
      recognizeStreamTimeLimit: new Date(Date.now() + RECOGNIZE_STREAM_TIME_LIMIT * 60000),
      conversationId,
    };

    streamSessions.set(conversationUuid, streamSession);
  },
};

const newConversationInProgressHandler: SocketListener = {
  event: 'new-conversation-in-progress',
  callback: (socket: Socket, payload: NewConversationPayload) => {
    console.log('new-conversation-in-progress');

    const { conversationUuid, data } = payload;

    const streamSession = streamSessions.get(conversationUuid);

    if (!streamSession) {
      return;
    }

    const { fileStream, recognizeStream, recognizeStreamTimeLimit } = streamSession;
    let temporalRecognizeStream = recognizeStream;
    let temporalRecognizeStreamTimeLimit = recognizeStreamTimeLimit;

    if (temporalRecognizeStreamTimeLimit < new Date()) {
      // when the time limit is reached, we create a new recognizeStream restarting the process
      console.log('The RecognizeStream time limit is reached, we create a new recognizeStream restarting the process');
      temporalRecognizeStream.end();

      temporalRecognizeStream = buildRecognizeStream(socket, conversationUuid);
      temporalRecognizeStreamTimeLimit = new Date(Date.now() + RECOGNIZE_STREAM_TIME_LIMIT * 60000);
    }

    const buffer = Buffer.from(data);

    fileStream.write(buffer);
    temporalRecognizeStream.write(data);

    streamSessions.set(conversationUuid, {
      ...streamSession,
      fileStream,
      recognizeStream: temporalRecognizeStream,
      recognizeStreamTimeLimit: temporalRecognizeStreamTimeLimit,
    });
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
  },
};

const listeners: SocketListener[] = [
  newConversationStartedHandler,
  newConversationInProgressHandler,
  newConversationStoppedHandler,
];

export default listeners;
