import express from 'express';
import { Bucket, Storage } from '@google-cloud/storage';

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

export default router;
