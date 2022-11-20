import mercadoPagoClient from '../../../../setup/mercadoPago';
import ProviderPlanService, { CreateInput, UpdateInput } from '../domain/ProviderPlanService';

const INTERVAL = 'months';
const INTERVAL_COUNT = 1;

interface MercadoPagoPlan {
  id: string;
  application_id: number;
  collector_id: number;
  reason: string;
  auto_recurring: AutoRecurring;
  payment_methods_allowed: PaymentMethodsAllowed;
  back_url: string;
  external_reference: number;
  init_point: string;
  date_created: Date;
  last_modified: Date;
  status: string;
}

interface AutoRecurring {
  frequency: number;
  frequency_type: string;
  repetitions: number;
  billing_day: number;
  billing_day_proportional: boolean;
  free_trial: FreeTrial;
  transaction_amount: number;
  currency_id: string;
}

interface FreeTrial {
  frequency: number;
  frequency_type: string;
}

interface PaymentMethodsAllowed {
  payment_types: Payment[];
  payment_methods: Payment[];
}

interface Payment {}

interface MercadoPagoPlanResponse {
  data: MercadoPagoPlan;
  status: number;
}

class MercadoPagoProviderPlanService implements ProviderPlanService {
  public async create({ title, currency, price, trialDays }: CreateInput): Promise<string> {
    const payload = {
      reason: title,
      auto_recurring: {
        frequency: INTERVAL_COUNT,
        frequency_type: INTERVAL,
        free_trial: {
          frequency: trialDays,
          frequency_type: 'days',
        },
        transaction_amount: price,
        currency_id: currency,
      },
      // back_url: 'https://www.speeky.app',
    };

    const { data }: MercadoPagoPlanResponse = await mercadoPagoClient.post('/preapproval_plan', payload);

    return data.id;
  }

  public async updateById(id: string, { title, currency, price, trialDays }: UpdateInput): Promise<void> {
    throw new Error('Method not implemented.');
  }

  public async deleteById(id: string): Promise<void> {
    throw new Error('Method not implemented.');
  }
}

export const mercadoPagoProviderPlanService = new MercadoPagoProviderPlanService();

export default MercadoPagoProviderPlanService;
