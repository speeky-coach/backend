import { Socket } from 'socket.io';
import fs, { WriteStream } from 'fs';
import { SocketListener } from '../../../framework';

interface NewConversationPayload {
  userId: string;
  conversationId: string;
  status: 'started' | 'in-progress' | 'stopped';
  data: ArrayBuffer;
}

const conversationStreams: Map<string, WriteStream> = new Map();

const newConversationStartedHandler: SocketListener = {
  event: 'new-conversation-started',
  callback: (socket: Socket, payload: Omit<NewConversationPayload, 'data'>) => {
    console.log('new-conversation-started');
    const { userId, conversationId } = payload;

    const fileStream = fs.createWriteStream('./' + conversationId + '.webm');

    conversationStreams.set(conversationId, fileStream);
  },
};

const newConversationInProgressHandler: SocketListener = {
  event: 'new-conversation-in-progress',
  callback: (socket: Socket, payload: NewConversationPayload) => {
    console.log('new-conversation-in-progress');
    const { userId, conversationId, data } = payload;
    console.log('data:', data);

    const fileStream = conversationStreams.get(conversationId);

    if (!fileStream) {
      return;
    }

    fileStream.write(Buffer.from(data));
  },
};

const newConversationStoppedHandler: SocketListener = {
  event: 'new-conversation-stopped',
  callback: (socket: Socket, payload: Omit<NewConversationPayload, 'data'>) => {
    console.log('new-conversation-stopped');
    const { userId, conversationId } = payload;

    const fileStream = conversationStreams.get(conversationId);
    console.log('fileStream:', fileStream);

    if (!fileStream) {
      return;
    }

    fileStream.end();

    conversationStreams.delete(conversationId);
  },
};

const listeners: SocketListener[] = [
  newConversationStartedHandler,
  newConversationInProgressHandler,
  newConversationStoppedHandler,
];

export default listeners;
