import { Socket } from 'socket.io';
import { Writable } from 'stream';
import speech, { protos, v1p1beta1 } from '@google-cloud/speech';
import { SocketListener } from '../../../framework';
import { StreamingRecognitionConfig, StreamingRecognizeResponse } from './types';
import { getParagraphs } from './domain/conversation';

const EVENT_PREFIX = 'coaching::speech-recognition';
const CLIENT_CONVERSATION_EVENT_PREFIX = 'client::conversation';

interface StreamSession {
  recognizeStream: Writable;
  userId: string;
  conversationId: string;
  audioSegmentIndex: number;
  offsetTime: number;
}

const streamSessions: Map<string, StreamSession> = new Map();

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
};

function handleRecognizeStreamData(
  socket: Socket,
  conversationId: string,
  audioSegmentIndex: number,
  offsetTime: number,
) {
  console.log('handleRecognizeStreamData');

  return async function (data: StreamingRecognizeResponse) {
    const result = data.results[0];
    const { isFinal, alternatives } = result;

    if (alternatives) {
      const { transcript } = alternatives[0];

      socket.emit(`${CLIENT_CONVERSATION_EVENT_PREFIX}::interim-transcription-received`, {
        conversationId,
        interimMessage: transcript,
        audioSegmentIndex,
        offsetTime,
      });
    }

    if (alternatives && isFinal) {
      const paragraphs = getParagraphs(alternatives[0], offsetTime);

      socket.emit(`${CLIENT_CONVERSATION_EVENT_PREFIX}::final-transcription-received`, {
        conversationId,
        paragraphs,
        audioSegmentIndex,
        offsetTime,
      });
    }
  };
}

function buildRecognizeStream(socket: Socket, conversationId: string, audioSegmentIndex: number, offsetTime: number) {
  const recognizeStream = client
    .streamingRecognize(request)
    .on('error', console.error)
    .on('data', handleRecognizeStreamData(socket, conversationId, audioSegmentIndex, offsetTime));

  return recognizeStream;
}

function createStreamSession(
  socket: Socket,
  userId: string,
  conversationId: string,
  audioSegmentIndex: number,
  offsetTime: number,
): StreamSession {
  const streamSessionId = `${conversationId}-${audioSegmentIndex}`;

  const recognizeStream = buildRecognizeStream(socket, conversationId, audioSegmentIndex, offsetTime);

  const streamSession: StreamSession = {
    recognizeStream,
    userId,
    conversationId,
    audioSegmentIndex,
    offsetTime,
  };

  streamSessions.set(streamSessionId, streamSession);

  return streamSession;
}

interface AudioStreamPayload {
  userId: string;
  conversationId: string;
  audioSegmentIndex: number;
  offsetTime: number;
  data: ArrayBuffer;
}

const audioStreamStartedHandler: SocketListener = {
  event: `${EVENT_PREFIX}::audio-stream-started`,
  callback: async (socket: Socket, payload: AudioStreamPayload) => {
    const { userId, conversationId, audioSegmentIndex, offsetTime } = payload;

    console.log(
      `audio-stream-started => userId: ${userId}, conversationId: ${conversationId}, audioSegmentIndex: ${audioSegmentIndex}`,
    );

    const streamSessionId = `${conversationId}-${audioSegmentIndex}`;
    const streamSession = streamSessions.get(streamSessionId);

    if (streamSession) {
      console.warn(
        `Stream session already exists for conversationId: ${conversationId}, audioSegmentIndex: ${audioSegmentIndex}`,
      );

      return;
    }

    createStreamSession(socket, userId, conversationId, audioSegmentIndex, offsetTime);
  },
};

const audioStreamCapturedHandler: SocketListener = {
  event: `${EVENT_PREFIX}::audio-stream-captured`,
  callback: async (socket: Socket, payload: AudioStreamPayload) => {
    const { userId, conversationId, audioSegmentIndex, offsetTime, data } = payload;

    console.log(
      `audio-stream-captured => userId: ${userId}, conversationId: ${conversationId}, audioSegmentIndex: ${audioSegmentIndex}`,
    );

    const streamSessionId = `${conversationId}-${audioSegmentIndex}`;
    const streamSession = streamSessions.get(streamSessionId);

    if (!streamSession) {
      console.warn(
        `Stream session not found for conversationId: ${conversationId}, audioSegmentIndex: ${audioSegmentIndex}`,
      );

      return;
    }

    const { recognizeStream } = streamSession;
    recognizeStream.write(data);
  },
};

const audioStreamEndedHandler: SocketListener = {
  event: `${EVENT_PREFIX}::audio-stream-ended`,
  callback: async (socket: Socket, payload: AudioStreamPayload) => {
    const { userId, conversationId, audioSegmentIndex } = payload;

    console.log(
      `audio-stream-ended => userId: ${userId}, conversationId: ${conversationId}, audioSegmentIndex: ${audioSegmentIndex}`,
    );

    const streamSessionId = `${conversationId}-${audioSegmentIndex}`;
    const streamSession = streamSessions.get(streamSessionId);

    if (!streamSession) {
      console.warn(
        `Stream session not found for conversationId: ${conversationId}, audioSegmentIndex: ${audioSegmentIndex}`,
      );

      return;
    }

    const { recognizeStream } = streamSession;
    recognizeStream.end();
    streamSessions.delete(streamSessionId);
  },
};

const listeners: SocketListener[] = [audioStreamStartedHandler, audioStreamCapturedHandler, audioStreamEndedHandler];

export default listeners;
