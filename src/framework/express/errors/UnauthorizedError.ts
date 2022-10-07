import HttpError from './HttpError';

class UnauthorizedError extends HttpError {
  static STATUS_CODE = 401;
  statusCode = UnauthorizedError.STATUS_CODE;

  constructor(public message: string = 'Not Authorized') {
    super(message);

    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }

  serializeErrors() {
    return [{ code: this.statusCode, message: this.message }];
  }
}

export default UnauthorizedError;
