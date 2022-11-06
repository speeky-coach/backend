import { NotFoundDomainError } from '../../../../../framework';
import { PlanId } from '../../../plans/domain/Plan';

class PlanDoesNotExistError extends NotFoundDomainError {
  code: string = 'ERROR_SUBSCRIPTION_001';

  constructor(planId: PlanId) {
    super(`Does not exist a plan with ID: ${planId}`);
  }
}

export default PlanDoesNotExistError;
