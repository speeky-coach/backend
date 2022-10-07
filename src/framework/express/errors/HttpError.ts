export interface ErrorResponse {
  code?: string | number;
  message: string;
  field?: string;
}

abstract class HttpError extends Error {
  abstract statusCode: number;

  abstract serializeErrors(): ErrorResponse[];
}

export default HttpError;
