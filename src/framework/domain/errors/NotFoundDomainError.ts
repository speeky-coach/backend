import DomainError, { DomainErrorTypes } from './DomainError';

abstract class NotFoundDomainError extends DomainError {
  type = DomainErrorTypes.NotFound;
}

export default NotFoundDomainError;
