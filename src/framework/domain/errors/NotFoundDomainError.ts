import DomainError, { DomainErrorTypes } from './DomainError';

abstract class NotFoundDomainError extends DomainError {
  abstract errorType: DomainErrorTypes.NotFound;
}

export default NotFoundDomainError;
