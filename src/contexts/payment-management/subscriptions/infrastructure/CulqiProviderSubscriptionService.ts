import culqiClient from '../../../../setup/culqi';
import { CulqiCard } from '../../cards/infrastructure/CulqiProviderCardService';
import { CulqiPlan } from '../../plans/infrastructure/CulqiProviderPlanService';
import ProviderSubscriptionService, { CreateInput, ProviderSubscription } from '../domain/ProviderSubscriptionService';
import CulqiSubscriptionCharges from './culqi/CulqiSubscriptionCharges';

interface CulqiSubscription {
  object: 'subscription';
  id: string;
  creation_date: number;
  status: string;
  current_period: number;
  total_period: number;
  current_period_start: number;
  current_period_end: number;
  cancel_at_period_end: boolean;
  cancel_at: number | null;
  ended_at: number;
  next_billing_date: number;
  trial_start: number;
  trial_end: number;
  charges: CulqiSubscriptionCharges[];
  plan: CulqiPlan;
  card: CulqiCard;
  metadata: {};
}

interface CulqiResponse {
  data: CulqiSubscription;
  status: number;
}

class CulqiProviderSubscriptionService implements ProviderSubscriptionService {
  public async create({ plan, card }: CreateInput): Promise<ProviderSubscription> {
    const payload = {
      plan_id: plan.providerPlanId,
      card_id: card.providerCardId,
    };

    const { data }: CulqiResponse = await culqiClient.post('/subscriptions', payload);

    const providerSubscription: ProviderSubscription = {
      id: data.id,
      trialStart: new Date(data.trial_start),
      trialEnd: new Date(data.trial_end),
      nextBillingDate: new Date(data.next_billing_date),
    };

    return providerSubscription;
  }
}

export const culqiProviderSubscriptionService = new CulqiProviderSubscriptionService();

export default CulqiProviderSubscriptionService;
