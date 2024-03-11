import { Socket } from 'socket.io';
import { Writable } from 'stream';
import { Storage } from '@google-cloud/storage';
import { SocketListener, firestoreDb } from '../../../framework';
import StreamingRecognitionManager from './StreamingRecognitionManager';

const COLLECTION_NAME = 'conversations';

const storage = new Storage();
const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET!);

interface NewConversationPayload {
  userId: string;
  conversationUuid: string;
  data: ArrayBuffer;
}

interface StreamSession {
  fileStream: Writable;
  streamRecognitionManager: StreamingRecognitionManager;
  conversationId: string;
}

const streamSessions: Map<string, StreamSession> = new Map();

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

    const pathFile = `audios/${userId}/${conversationId}.wav`;
    const file = bucket.file(pathFile);
    // await file.makePublic();
    const fileStream = file.createWriteStream();
    fileStream.on('finish', () => {
      console.log(`File ${pathFile} uploaded.`);

      socket.emit('conversation-audio-uploaded', { conversationUuid, id: conversationId });
    });

    socket.emit('conversation-id-assigned', { conversationUuid, id: conversationId });

    const streamRecognitionManager = new StreamingRecognitionManager(socket, conversationUuid);

    const streamSession = {
      fileStream,
      streamRecognitionManager,
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

    const { fileStream, streamRecognitionManager } = streamSession;

    const buffer = Buffer.from(data);

    fileStream.write(buffer);
    streamRecognitionManager.write(data);

    streamSessions.set(conversationUuid, {
      ...streamSession,
      fileStream,
      streamRecognitionManager,
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

    const { fileStream, streamRecognitionManager } = streamSession;

    fileStream.end();
    streamRecognitionManager.end();

    streamSessions.delete(conversationUuid);
  },
};

const listeners: SocketListener[] = [
  newConversationStartedHandler,
  newConversationInProgressHandler,
  newConversationStoppedHandler,
];

export default listeners;
