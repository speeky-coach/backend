export enum DomainErrorTypes {
  NotFound = 'NOT_FOUND',
  BadUserInput = 'BAD_USER_INPUT',
}

abstract class DomainError extends Error {
  abstract type: DomainErrorTypes;
  abstract code: string;
  // abstract message: string;
}

export default DomainError;
