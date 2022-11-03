import Plan, { PlanId } from '../domain/Plan';
import PlanRepository, { AddInput, UpdateInput } from '../domain/PlanRepository';
import { firestoreDb } from '../../../../framework';

const COLLECTION_NAME = 'plans';

class FirestorePlanRepository implements PlanRepository {
  async add({ providerPlanId, title, currency, price, trialDays }: AddInput): Promise<Plan> {
    const createdAt = new Date();
    const updatedAt = new Date();

    const response = await firestoreDb
      .collection(COLLECTION_NAME)
      .add({ providerPlanId, title, currency, price, trialDays, createdAt, updatedAt });

    const newPlan: Plan = {
      id: response.id,
      providerPlanId,
      title,
      currency,
      price,
      trialDays,
      createdAt,
      updatedAt,
    };

    return newPlan;
  }

  async getById(id: PlanId): Promise<Plan | null> {
    const doc = await firestoreDb.collection(COLLECTION_NAME).doc(id).get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data()!;

    const plan: Plan = {
      ...data,
      id: doc.id,
      providerPlanId: data.providerPlanId,
      title: data.title,
      currency: data.currency,
      price: data.price,
      trialDays: data.trialDays,
      createdAt: new Date(data.createdAt._seconds * 1000),
      updatedAt: new Date(data.updatedAt._seconds * 1000),
    };

    return plan;
  }

  async updateById(id: PlanId, input: UpdateInput): Promise<void> {
    await firestoreDb.collection(COLLECTION_NAME).doc(id).set(input, { merge: true });
  }

  async deleteById(id: PlanId): Promise<void> {
    await firestoreDb.collection(COLLECTION_NAME).doc(id).delete();
  }
}

export const firestorePlanRepository = new FirestorePlanRepository();

export default FirestorePlanRepository;
