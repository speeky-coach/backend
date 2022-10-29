import express from 'express';
import PlanCommandsController from './PlanCommandsController';
import PlanQueriesController from './PlanQueriesController';

const router = express.Router();

router.post('/plans', PlanCommandsController.create);
router.patch('/plans/:planId', PlanCommandsController.update);
router.delete('/plans/:planId', PlanCommandsController.delete);

router.get('/plans/:planId', PlanQueriesController.get);
router.get('/plans', PlanQueriesController.list);

export default router;
