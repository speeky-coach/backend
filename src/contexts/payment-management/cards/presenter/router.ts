import express from 'express';
import CardCommandsController from './CardCommandsController';

const router = express.Router();

router.post('/cards', CardCommandsController.create);

export default router;
