import PlanApplication from './PlanApplication';
import { firestorePlanRepository } from '../infrastructure/FirestorePlanRepository';
import { culqiProviderPlanService } from '../infrastructure/CulqiProviderPlanService';

const planApplicationInteractor = new PlanApplication(firestorePlanRepository, culqiProviderPlanService);

export default planApplicationInteractor;
