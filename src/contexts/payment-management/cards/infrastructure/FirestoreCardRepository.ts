import { firestoreDb } from '../../../../framework';
import Card from '../domain/Card';
import CardRepository, { AddInput } from '../domain/CardRepository';

const COLLECTION_NAME = 'cards';

class FirestoreCardRepository implements CardRepository {
  public async add(input: AddInput): Promise<Card> {
    const createdAt = new Date();
    const updatedAt = new Date();

    const response = await firestoreDb.collection(COLLECTION_NAME).add({ ...input, createdAt, updatedAt });

    const newCard: Card = {
      ...input,
      id: response.id,
      createdAt,
      updatedAt,
    };

    return newCard;
  }
}

export const firestoreCardRepository = new FirestoreCardRepository();

export default FirestoreCardRepository;
