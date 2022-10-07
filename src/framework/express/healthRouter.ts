import express, { NextFunction, Request, Response } from 'express';

const healthRouter = express.Router();

function healthController(request: Request, response: Response, next: NextFunction) {
  response.json({
    status: 200,
    message: 'Service is working',
  });
}

healthRouter.get('/health', healthController);

export default healthRouter;
