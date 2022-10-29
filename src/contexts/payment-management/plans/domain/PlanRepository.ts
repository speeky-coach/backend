import Plan, { PlanId } from './Plan';

export type AddInput = Pick<Plan, 'providerPlanId' | 'title' | 'currency' | 'price' | 'trialDays'>;
export type UpdateInput = Partial<Pick<Plan, 'title' | 'currency' | 'price' | 'trialDays'>>;

interface PlanRepository {
  add(input: AddInput): Promise<Plan>;
  getById(id: PlanId): Promise<Plan | null>;
  updateById(id: PlanId, input: UpdateInput): Promise<void>;
  deleteById(id: PlanId): Promise<void>;
}

export default PlanRepository;
