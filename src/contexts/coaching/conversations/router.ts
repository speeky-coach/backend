import express from 'express';
import { Bucket, Storage } from '@google-cloud/storage';
import { writeFile } from 'node:fs/promises';
import speech, { protos } from '@google-cloud/speech';

const storage = new Storage();
const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET!);

const router = express.Router();

router.post('/conversations', (request, response, next) => {
  const { userId, filename } = request.query;

  const pathFile = `audio_test.wav`;
  const file = bucket.file(pathFile);
  const stream = file.createWriteStream();

  request.pipe(stream).on('finish', () => {
    response.status(200).send({ path: pathFile });
  });
});

const client = new speech.v1p1beta1.SpeechClient();

const gcsUri = 'gs://speeky-development/audio_test.webm';
const encoding = protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.WEBM_OPUS;
const sampleRateHertz = 48000;
const languageCode = 'en-US';

const config = {
  encoding,
  sampleRateHertz,
  languageCode,
  // audioChannelCount: 2,
  enableSpeakerDiarization: true,
  minSpeakerCount: 2,
  maxSpeakerCount: 2,
  model: 'phone_call',
  enableAutomaticPunctuation: true,
  enableWordTimeOffsets: true,
  enableWordConfidence: true,
};

const audio = {
  uri: gcsUri,
};

const requestConfig: protos.google.cloud.speech.v1.ILongRunningRecognizeRequest = {
  config,
  audio,
};

interface Word {
  startsAt: string;
  endsAt: string;
  value: string;
  confidence: number;
}

interface Paragraph {
  speakerId: number;
  startsAt: string;
  endsAt: string;
  value: string;
  words: Word[];
}

router.post('/conversations/recognize', async (request, response, next) => {
  try {
    console.log('Detects speech in the audio file');

    const [operation] = await client.longRunningRecognize(requestConfig);

    console.log({ operation });

    console.log('Get a Promise representation of the final result of the job');

    const [response] = await operation.promise();

    console.log({ response });

    await writeFile('./data/response.json', JSON.stringify(response));

    const transcription = response
      .results!.map((result) => {
        console.log({ result });

        console.log({ alternatives: result.alternatives! });

        console.log({ alternative_0: JSON.stringify(result.alternatives![0]) });

        return result.alternatives![0].transcript;
      })
      .join('\n');

    console.log(`Transcription: ${transcription}`);
  } catch (error) {
    console.log(error);
  }

  response.status(200).send('oki');
});

export default router;
