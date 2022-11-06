import Plan, { PlanId } from '../../plans/domain/Plan';

interface PlanService {
  getById(planId: PlanId): Promise<Plan | null>;
}

export default PlanService;
