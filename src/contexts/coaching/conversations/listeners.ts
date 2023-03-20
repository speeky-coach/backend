import { Socket } from 'socket.io';
import fs, { WriteStream } from 'fs';
import { Writable } from 'stream';
import { Bucket, Storage } from '@google-cloud/storage';
import speech, { protos } from '@google-cloud/speech';
import { SocketListener } from '../../../framework';
import { StreamingRecognitionConfig, StreamingRecognizeResponse } from './types';

const storage = new Storage();
const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET!);

const client = new speech.SpeechClient();

const request: StreamingRecognitionConfig = {
  config: {
    encoding: 'WEBM_OPUS',
    sampleRateHertz: 48000,
    languageCode: 'en-US',
    enableAutomaticPunctuation: true,
  },
  interimResults: true, // Enable interim results for real-time transcription
  singleUtterance: false, // Do not stop after the first utterance
};

interface NewConversationPayload {
  userId: string;
  conversationId: string;
  data: ArrayBuffer;
}

interface StreamSession {
  fileStream: Writable;
  recognizeStream: Writable;
}

const streamSessions: Map<string, StreamSession> = new Map();
const resultArray: any[] = [];

const newConversationStartedHandler: SocketListener = {
  event: 'new-conversation-started',
  callback: (socket: Socket, payload: Omit<NewConversationPayload, 'data'>) => {
    console.log('new-conversation-started');
    const { userId, conversationId } = payload;

    const pathFile = `audio_test.webm`;
    const file = bucket.file(pathFile);
    const fileStream = file.createWriteStream();

    const recognizeStream = client
      .streamingRecognize(request)
      .on('error', console.error)
      .on('data', (data: StreamingRecognizeResponse) => {
        resultArray.push(data);
        const result = data.results[0];
        if (result.isFinal) {
          // save resultArray as json file at ./data/resultArray.json
          // with indent 2
          fs.writeFileSync('./data/resultArray.json', JSON.stringify(resultArray, null, 2));

          const transcript = result.alternatives![0].transcript;
          // console.log(`Final transcript: ${transcript}`);
        } else {
          const interimTranscript = result.alternatives![0].transcript;
          // console.log(`Interim transcript: ${interimTranscript}`);
          // socket.emit('transcript', interimTranscript);
        }
      });

    const streamSession = {
      fileStream,
      recognizeStream,
    };

    streamSessions.set(conversationId, streamSession);
  },
};

const newConversationInProgressHandler: SocketListener = {
  event: 'new-conversation-in-progress',
  callback: (socket: Socket, payload: NewConversationPayload) => {
    console.log('new-conversation-in-progress');
    const { userId, conversationId, data } = payload;
    console.log('data:', data);

    const streamSession = streamSessions.get(conversationId);

    if (!streamSession) {
      return;
    }

    const { fileStream, recognizeStream } = streamSession;

    const buffer = Buffer.from(data);

    fileStream.write(buffer);
    recognizeStream.write(data);
  },
};

const newConversationStoppedHandler: SocketListener = {
  event: 'new-conversation-stopped',
  callback: (socket: Socket, payload: Omit<NewConversationPayload, 'data'>) => {
    console.log('new-conversation-stopped');
    const { userId, conversationId } = payload;

    const streamSession = streamSessions.get(conversationId);

    if (!streamSession) {
      return;
    }

    const { fileStream, recognizeStream } = streamSession;

    fileStream.end();
    recognizeStream.end();

    streamSessions.delete(conversationId);
  },
};

const listeners: SocketListener[] = [
  newConversationStartedHandler,
  newConversationInProgressHandler,
  newConversationStoppedHandler,
];

export default listeners;
