import Card from '../../cards/domain/Card';
import Plan from '../../plans/domain/Plan';

export type ProviderSubscriptionId = string;

export interface ProviderSubscription {
  id: ProviderSubscriptionId;
  trialStart: Date | null;
  trialEnd: Date | null;
  nextBillingDate: Date;
}

export type CreateInput = {
  plan: Plan;
  card: Card;
};

interface ProviderSubscriptionService {
  create(input: CreateInput): Promise<ProviderSubscription>;
}

export default ProviderSubscriptionService;
