import express from 'express';

import conversationsModule from './conversations';
import languageAnalysisModule from './language-analysis';

const router = express.Router();

const MODULE_ROUTE = '/coaching';

router.use(MODULE_ROUTE, conversationsModule.router);
router.use(MODULE_ROUTE, languageAnalysisModule.router);

export default {
  router,
  listeners: [...conversationsModule.listeners],
};
