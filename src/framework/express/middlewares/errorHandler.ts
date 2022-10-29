import { Request, Response } from 'express';
import HttpError, { ErrorResponse } from '../errors/HttpError';
import logger from '../../logger/winston';
import { DomainError, DomainErrorTypes } from '../../domain';

export interface ErrorBody {
  errors: ErrorResponse[];
}

const errorHandler = (error: Error, req: Request, res: Response, next): void => {
  if (error instanceof DomainError) {
    const errorBody: ErrorBody = {
      errors: [
        {
          type: error.type,
          code: error.code,
          message: error.message,
        },
      ],
    };

    logger.error(`[domain error ${error.code}]: ${error.message}`);

    const statusCode = error.type === DomainErrorTypes.NotFound ? 404 : 400;

    res.status(statusCode).send(errorBody);
    return;
  }

  if (error instanceof HttpError) {
    const errorBody: ErrorBody = {
      errors: error.serializeErrors(),
    };

    res.status(error.statusCode).send(errorBody);
    return;
  }

  logger.error('Express Error Handler: Server Error 500', { error });

  res.status(500).send({
    errors: [{ message: 'Something went wrong' }],
  });
};

export default errorHandler;
