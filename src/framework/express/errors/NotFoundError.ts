import HttpError from './HttpError';

class NotFoundError extends HttpError {
  statusCode = 404;

  constructor(public message: string = 'Not found') {
    super(message);

    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  serializeErrors() {
    return [{ code: this.statusCode, message: this.message }];
  }
}

export default NotFoundError;
