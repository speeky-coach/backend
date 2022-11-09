import Subscription from './Subscription';

interface SubscriptionRepository {
  add(subscription: Omit<Subscription, 'id'>): Promise<Subscription>;
}

export default SubscriptionRepository;
