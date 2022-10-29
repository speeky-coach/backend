import { ProviderPlanId } from './ProviderPlanService';

export type PlanId = string;

interface Plan {
  id: PlanId;
  providerPlanId: ProviderPlanId;
  title: string;
  currency: 'USD';
  price: number;
  trialDays: number;
  createdAt: Date;
  updatedAt: Date;
}

export default Plan;
