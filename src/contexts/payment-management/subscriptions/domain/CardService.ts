import Card, { CardId } from '../../cards/domain/Card';

interface CardService {
  getById(cardId: CardId): Promise<Card | null>;
}

export default CardService;
