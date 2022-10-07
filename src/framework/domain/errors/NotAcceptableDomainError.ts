import DomainError, { DomainErrorTypes } from './DomainError';

abstract class NotAcceptableDomainError extends DomainError {
  abstract errorType: DomainErrorTypes.NotAcceptable;
}

export default NotAcceptableDomainError;
