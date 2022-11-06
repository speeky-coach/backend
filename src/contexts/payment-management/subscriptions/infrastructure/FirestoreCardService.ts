import { firestoreDb } from '../../../../framework';
import Card, { CardId } from '../../cards/domain/Card';
import CardService from '../domain/CardService';

const COLLECTION_NAME = 'cards';

class FirestoreCardService implements CardService {
  public async getById(cardId: CardId): Promise<Card | null> {
    const doc = await firestoreDb.collection(COLLECTION_NAME).doc(cardId).get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data()!;

    const card = {
      ...data,
      id: doc.id,
      createdAt: new Date(data.createdAt._seconds * 1000),
      updatedAt: new Date(data.updatedAt._seconds * 1000),
    } as Card;

    return card;
  }
}

export const firestoreCardService = new FirestoreCardService();

export default FirestoreCardService;
