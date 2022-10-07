import HttpError from './HttpError';

class NotAcceptableError extends HttpError {
  statusCode = 406;

  errors: any[];

  constructor(errors: any[]) {
    super('Invalid request parameters');
    this.errors = errors;

    Object.setPrototypeOf(this, NotAcceptableError.prototype);
  }

  serializeErrors() {
    return this.errors;
  }
}

export default NotAcceptableError;
