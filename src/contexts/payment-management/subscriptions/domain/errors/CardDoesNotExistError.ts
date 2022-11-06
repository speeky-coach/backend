import { NotFoundDomainError } from '../../../../../framework';
import { CardId } from '../../../cards/domain/Card';

class CardDoesNotExistError extends NotFoundDomainError {
  code: string = 'ERROR_SUBSCRIPTION_002';

  constructor(cardId: CardId) {
    super(`Does not exist a card with ID: ${cardId}`);
  }
}

export default CardDoesNotExistError;
