import { DomainEvent } from '../../../../../framework';
import Subscription from '../Subscription';

class SubscriptionCreated extends DomainEvent {
  static readonly EVENT_NAME = 'domain_event.subscription.created';

  readonly data: Subscription;

  constructor(data: Subscription) {
    super(SubscriptionCreated.EVENT_NAME, data.id);
    this.data = data;
  }
}

export default SubscriptionCreated;
