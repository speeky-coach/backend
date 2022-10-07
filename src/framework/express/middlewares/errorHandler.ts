import { Request, Response } from 'express';
import HttpError, { ErrorResponse } from '../errors/HttpError';
import logger from '../../logger/winston';

export interface ErrorBody {
  errors: ErrorResponse[];
}

const errorHandler = (err: Error, req: Request, res: Response, next): void => {
  if (err instanceof HttpError) {
    const errorBody: ErrorBody = {
      errors: err.serializeErrors(),
    };

    res.status(err.statusCode).send(errorBody);
  } else {
    logger.error('Express Error Handler: Server Error 500');

    logger.error(err);

    res.status(500).send({
      errors: [{ message: 'Something went wrong' }],
    });
  }
};

export default errorHandler;
