import mqtt from 'mqtt';

interface Payload {
  userId: string;
  conversationId: string;
  data: string;
}

const options = {
  connectTimeout: 4000, // Timeout period
  clientId: 'speeky_backend',
  username: 'speeky_backend',
};

const conversationInProgress = new Map();

const client = mqtt.connect('mqtt://localhost:1883', options);

client.subscribe('audio/#', (err) => {
  if (err) {
    console.error('Failed to subscribe:', err);
  } else {
    console.log('Subscribed to topic');
  }
});

// client.publish

client.on('message', (topic, message) => {
  // console.log('Received message:', message.toString());
  console.log('Received message: ==========================================>');

  console.log('topic:', topic);

  // TODO: Save audio file to Google Cloud Storage
  const payload: Payload = JSON.parse(message.toString());
  const { userId, conversationId, data } = payload;

  const buffer = Buffer.from(data, 'base64');

  console.log('userId:', userId);
  console.log('conversationId:', conversationId);
  console.log('buffer:');
  console.log(buffer);

  if (conversationInProgress.has(conversationId)) {
    conversationInProgress.set(conversationId, Buffer.concat([conversationInProgress.get(conversationId), buffer]));
  } else {
    conversationInProgress.set(conversationId, buffer);
  }
});
