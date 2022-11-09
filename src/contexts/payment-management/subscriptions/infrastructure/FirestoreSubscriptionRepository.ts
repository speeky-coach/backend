import { firestoreDb } from '../../../../framework';
import Subscription from '../domain/Subscription';
import SubscriptionRepository from '../domain/SubscriptionRepository';

const COLLECTION_NAME = 'subscriptions';

class FirestoreSubscriptionRepository implements SubscriptionRepository {
  public async add(subscription: Omit<Subscription, 'id'>): Promise<Subscription> {
    const response = await firestoreDb.collection(COLLECTION_NAME).add(subscription);

    const subscriptionWithId: Subscription = {
      ...subscription,
      id: response.id,
    };

    return subscriptionWithId;
  }
}

export const firestoreSubscriptionRepository = new FirestoreSubscriptionRepository();

export default FirestoreSubscriptionRepository;
