import { firestoreDb } from '../../../../framework';
import Plan, { PlanId } from '../../plans/domain/Plan';
import PlanService from '../domain/PlanService';

const COLLECTION_NAME = 'plans';

class FirestorePlanService implements PlanService {
  public async getById(planId: PlanId): Promise<Plan | null> {
    const doc = await firestoreDb.collection(COLLECTION_NAME).doc(planId).get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data()!;

    const plan = {
      ...data,
      id: doc.id,
      createdAt: new Date(data.createdAt._seconds * 1000),
      updatedAt: new Date(data.updatedAt._seconds * 1000),
    } as Plan;

    return plan;
  }
}

export const firestorePlanService = new FirestorePlanService();

export default FirestorePlanService;
