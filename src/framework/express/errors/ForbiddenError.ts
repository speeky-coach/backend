import HttpError from './HttpError';

class ForbiddenError extends HttpError {
  statusCode = 403;

  constructor(public message: string = 'Forbidden') {
    super(message);

    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }

  serializeErrors() {
    return [{ code: this.statusCode, message: this.message }];
  }
}

export default ForbiddenError;
