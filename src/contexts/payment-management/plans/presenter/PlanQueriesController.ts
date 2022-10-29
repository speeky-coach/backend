import { Request, Response } from 'express';
import { withErrorHandler, firestoreDb, NotFoundError } from '../../../../framework';

const COLLECTION_NAME = 'plans';

class PlanQueriesController {
  @withErrorHandler
  static async get(request: Request, response: Response): Promise<void> {
    const { planId } = request.params;

    const doc = await firestoreDb.collection(COLLECTION_NAME).doc(planId).get();

    if (!doc.exists) {
      throw new NotFoundError(`Does not exist a plan with ID: ${planId}`);
    }

    const plan = doc.data()!;

    response.json({
      ...plan,
      id: doc.id,
      createdAt: new Date(plan.createdAt._seconds * 1000),
      updatedAt: new Date(plan.updatedAt._seconds * 1000),
    });
  }

  @withErrorHandler
  static async list(request: Request, response: Response): Promise<void> {
    const plansList: any[] = [];

    const snapshot = await firestoreDb.collection(COLLECTION_NAME).get();

    snapshot.forEach((doc) => {
      const plan = doc.data();

      plansList.push({
        ...plan,
        id: doc.id,
        createdAt: new Date(plan.createdAt._seconds * 1000),
        updatedAt: new Date(plan.updatedAt._seconds * 1000),
      });
    });

    response.json(plansList);
  }
}

export default PlanQueriesController;
