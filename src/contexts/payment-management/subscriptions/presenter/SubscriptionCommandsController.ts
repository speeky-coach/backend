import { Request, Response } from 'express';
import { ExpressPresenter, withErrorHandler } from '../../../../framework';
import interactor from '../infrastructure/interactor';

class SubscriptionCommandsController {
  @withErrorHandler
  static async create(request: Request, response: Response): Promise<void> {
    const { studentId, planId, cardId } = request.body;

    const subscription = await interactor.create({ studentId, planId, cardId });

    const presenter = new ExpressPresenter(response);

    presenter.returnNewEntity(subscription);
  }
}

export default SubscriptionCommandsController;
