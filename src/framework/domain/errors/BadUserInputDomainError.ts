import DomainError, { DomainErrorTypes } from './DomainError';

abstract class BadUserInputDomainError extends DomainError {
  type = DomainErrorTypes.BadUserInput;
}

export default BadUserInputDomainError;
