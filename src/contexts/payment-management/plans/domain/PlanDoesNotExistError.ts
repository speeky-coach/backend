import { NotFoundDomainError } from '../../../../framework';
import { PlanId } from './Plan';

class PlanDoesNotExistError extends NotFoundDomainError {
  code: string = 'ERRORPLAN-001';

  constructor(planId: PlanId) {
    super(`Does not exist a plan with ID: ${planId}`);
  }
}

export default PlanDoesNotExistError;
