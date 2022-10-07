import HttpError from './HttpError';

class ConflictError extends HttpError {
  statusCode = 409;

  constructor(public message: string = 'Conflict') {
    super(message);

    Object.setPrototypeOf(this, ConflictError.prototype);
  }

  serializeErrors() {
    return [{ code: this.statusCode, message: this.message }];
  }
}

export default ConflictError;
