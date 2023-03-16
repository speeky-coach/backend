import express from 'express';

import conversationsModule from './conversations/module';

const router = express.Router();
const MODULE_ROUTE = '/coaching';
router.use(MODULE_ROUTE, conversationsModule.router);

export default {
  router,
};
