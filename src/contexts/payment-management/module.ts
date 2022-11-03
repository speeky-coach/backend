import express from 'express';

import plansModule from './plans/module';
import studentBillingProfilesModule from './student-billing-profiles/module';

const router = express.Router();
router.use('/payment-management', plansModule.router);
router.use('/payment-management', studentBillingProfilesModule.router);

export default {
  router,
};
