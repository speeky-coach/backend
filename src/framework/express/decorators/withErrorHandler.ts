import { Request, Response, NextFunction } from 'express';

type Controller = (request: Request, response: Response, next: NextFunction) => Promise<void>;

function withErrorHandler(target: Object, propertyKey: string, descriptor: PropertyDescriptor): void {
  const originalController = descriptor.value as Controller;

  descriptor.value = async function (request: Request, response: Response, next: NextFunction): Promise<void> {
    try {
      await originalController.call(target, request, response, next);
    } catch (error) {
      next(error);
    }
  };
}

export default withErrorHandler;
