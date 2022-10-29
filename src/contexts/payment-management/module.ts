import express from 'express';

import plansModule from './plans/module';

const router = express.Router();
router.use('/payment-management', plansModule.router);

export default {
  router,
};
