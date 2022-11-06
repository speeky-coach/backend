import Subscription from './Subscription';

interface SubscriptionRepository {
  add(subscription: Subscription): Promise<Subscription>;
}

export default SubscriptionRepository;
