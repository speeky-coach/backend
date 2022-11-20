import mercadoPagoClient from '../../../../setup/mercadoPago';
import ProviderSubscriptionService, { CreateInput, ProviderSubscription } from '../domain/ProviderSubscriptionService';

interface MercadoPagoSubscription {
  id: string;
  version: number;
  application_id: number;
  collector_id: number;
  preapproval_plan_id: string;
  reason: string;
  external_reference: number;
  back_url: string;
  init_point: string;
  auto_recurring: AutoRecurring;
  payer_id: number;
  card_id: number;
  payment_method_id: number;
  next_payment_date: Date;
  date_created: Date;
  last_modified: Date;
  status: string;
}

interface AutoRecurring {
  frequency: number;
  frequency_type: string;
  start_date: Date;
  end_date: Date;
  currency_id: string;
  transaction_amount: number;
  free_trial: FreeTrial;
}

interface FreeTrial {
  frequency: number;
  frequency_type: string;
}

interface MercadoPagoResponse {
  data: MercadoPagoSubscription;
  status: number;
}

class MercadoPagoProviderSubscriptionService implements ProviderSubscriptionService {
  public async create({ plan, card }: CreateInput): Promise<ProviderSubscription> {
    const payload = {
      preapproval_plan_id: plan.providerPlanId,
      payer_email: 'test_user@testuser.com',
      card_token_id: card.providerCardId, // 'e3ed6f098462036dd2cbabe314b9de2a',
      status: 'authorized',
    };

    const { data }: MercadoPagoResponse = await mercadoPagoClient.post('/preapproval', payload);

    const trialStart = new Date(data.date_created);
    const trialEnd = new Date(data.date_created);
    trialEnd.setDate(trialEnd.getDate() + data.auto_recurring.free_trial.frequency);

    const providerSubscription: ProviderSubscription = {
      id: data.id,
      trialStart,
      trialEnd,
      nextBillingDate: new Date(data.next_payment_date),
    };

    return providerSubscription;
  }
}

export const mercadoPagoProviderSubscriptionService = new MercadoPagoProviderSubscriptionService();

export default MercadoPagoProviderSubscriptionService;
