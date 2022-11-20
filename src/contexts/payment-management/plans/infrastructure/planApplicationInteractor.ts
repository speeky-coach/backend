import PlanApplication from '../application/PlanApplication';
import { firestorePlanRepository } from './FirestorePlanRepository';
// import { culqiProviderPlanService } from './CulqiProviderPlanService';
import { mercadoPagoProviderPlanService } from './MercadoPagoProviderPlanService';

const planApplicationInteractor = new PlanApplication(firestorePlanRepository, mercadoPagoProviderPlanService);

export default planApplicationInteractor;
