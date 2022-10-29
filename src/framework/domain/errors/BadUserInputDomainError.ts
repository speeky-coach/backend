import DomainError, { DomainErrorTypes } from './DomainError';

abstract class BadUserInputDomainError extends DomainError {
  abstract errorType: DomainErrorTypes.BadUserInput;
}

export default BadUserInputDomainError;
