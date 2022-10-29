import Plan from './Plan';

export type ProviderPlanId = string;
export type CreateInput = Pick<Plan, 'title' | 'currency' | 'price' | 'trialDays'>;
export type UpdateInput = Partial<CreateInput>;

interface ProviderPlanService {
  create(input: CreateInput): Promise<ProviderPlanId>;
  updateById(id: ProviderPlanId, input: UpdateInput): Promise<void>;
  deleteById(id: ProviderPlanId): Promise<void>;
}

export default ProviderPlanService;
