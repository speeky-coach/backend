import Plan, { PlanId } from '../domain/Plan';
import PlanDoesNotExistError from '../domain/PlanDoesNotExistError';
import PlanRepository from '../domain/PlanRepository';
import ProviderPlanService from '../domain/ProviderPlanService';

type CreateInput = Pick<Plan, 'title' | 'currency' | 'price' | 'trialDays'>;
type UpdateInput = { id: PlanId } & Partial<CreateInput>;

class PlanApplication {
  constructor(private planRepository: PlanRepository, private providerPlanService: ProviderPlanService) {}

  async create({ title, currency, price, trialDays }: CreateInput): Promise<Plan> {
    const providerPlanId = await this.providerPlanService.create({ title, currency, price, trialDays });

    const plan = await this.planRepository.add({
      providerPlanId,
      title,
      currency,
      price,
      trialDays,
    });

    return plan;
  }

  async update({ id, ...input }: UpdateInput): Promise<void> {
    const plan = await this.planRepository.getById(id);

    if (!plan) {
      throw new PlanDoesNotExistError(id);
    }

    await this.providerPlanService.updateById(plan.providerPlanId, input);
    await this.planRepository.updateById(id, input);
  }

  async delete(id: PlanId): Promise<void> {
    const plan = await this.planRepository.getById(id);

    if (!plan) {
      throw new PlanDoesNotExistError(id);
    }

    await this.providerPlanService.deleteById(plan.providerPlanId);
    await this.planRepository.deleteById(id);
  }
}

export default PlanApplication;
