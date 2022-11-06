import culqiClient from '../../../../setup/culqi';
import ProviderPlanService, { CreateInput, UpdateInput } from '../domain/ProviderPlanService';

const INTERVAL = 'meses';
const INTERVAL_COUNT = 1;

export interface CulqiPlan {
  object: 'plan';
  id: string;
  creation_date: number;
  name: string;
  amount: number;
  currency_code: 'PEN' | 'USD';
  interval_count: number;
  interval: 'dias' | 'semanas' | 'meses' | 'años';
  limit: number;
  trial_days: number;
  total_subscriptions: number;
  metadata: {};
}

interface CulqiPlanResponse {
  data: CulqiPlan;
  status: number;
}

class CulqiProviderPlanService implements ProviderPlanService {
  public async create({ title, currency, price, trialDays }: CreateInput): Promise<string> {
    const payload = {
      name: title,
      amount: price * 100,
      currency_code: currency,
      interval: INTERVAL,
      interval_count: INTERVAL_COUNT,
      trial_days: trialDays > 0 ? trialDays : null,
    };

    const createCulqiPlanResponse: CulqiPlanResponse = await culqiClient.post('/plans', payload);

    return createCulqiPlanResponse.data.id;
  }

  public async updateById(id: string, { title, currency, price, trialDays }: UpdateInput): Promise<void> {
    let payload = {};

    if (title) {
      payload['name'] = title;
    }

    if (currency) {
      payload['currency_code'] = currency;
    }

    if (price) {
      payload['amount'] = price * 100;
    }

    if (trialDays) {
      payload['trial_days'] = trialDays;
    }

    await culqiClient.patch(`/plans/${id}`, payload);
  }

  public async deleteById(id: string): Promise<void> {
    await culqiClient.delete(`/plans/${id}`);
  }
}

export const culqiProviderPlanService = new CulqiProviderPlanService();

export default CulqiProviderPlanService;
