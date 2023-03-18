import { Socket } from 'socket.io';
import { SocketListener } from '../../../framework';

interface NewConversationPayload {
  userId: string;
  conversationId: string;
  status: 'started' | 'in-progress' | 'stopped';
  data: Blob;
}

const conversationStreams: Map<string, Blob[]> = new Map();

const newConversationStartedHandler: SocketListener = {
  event: 'new-conversation-started',
  callback: (socket: Socket, payload: Omit<NewConversationPayload, 'data'>) => {
    console.log('new-conversation-started');
    const { userId, conversationId } = payload;

    conversationStreams.set(conversationId, []);
  },
};

const newConversationInProgressHandler: SocketListener = {
  event: 'new-conversation-in-progress',
  callback: (socket: Socket, payload: NewConversationPayload) => {
    console.log('new-conversation-in-progress');
    const { userId, conversationId, data } = payload;
    console.log('data:', data);

    const buffer = conversationStreams.get(conversationId);

    if (!buffer) {
      return;
    }

    conversationStreams.set(conversationId, [...buffer, data]);
  },
};

const newConversationStoppedHandler: SocketListener = {
  event: 'new-conversation-stopped',
  callback: (socket: Socket, payload: Omit<NewConversationPayload, 'data'>) => {
    console.log('new-conversation-stopped');
    const { userId, conversationId } = payload;

    const buffer = conversationStreams.get(conversationId);
    console.log('buffer:', buffer);

    conversationStreams.delete(conversationId);
  },
};

const listeners: SocketListener[] = [
  newConversationStartedHandler,
  newConversationInProgressHandler,
  newConversationStoppedHandler,
];

export default listeners;
