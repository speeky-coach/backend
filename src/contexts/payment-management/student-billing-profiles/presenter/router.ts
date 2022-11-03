import express from 'express';
import StudentBillingProfileCommandsController from './StudentBillingProfileCommandsController';

const router = express.Router();

router.post('/student-billing-profiles', StudentBillingProfileCommandsController.create);

export default router;
