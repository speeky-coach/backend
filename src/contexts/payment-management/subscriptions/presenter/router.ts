import express from 'express';
import SubscriptionCommandsController from './SubscriptionCommandsController';

const router = express.Router();

router.post('/subscriptions', SubscriptionCommandsController.create);

export default router;
