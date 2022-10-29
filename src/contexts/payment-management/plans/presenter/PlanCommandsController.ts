import { Request, Response } from 'express';
import { ExpressPresenter, withErrorHandler } from '../../../../framework';
import planApplicationInteractor from '../application/planApplicationInteractor';

class PlanCommandsController {
  @withErrorHandler
  // @hasRole([])
  static async create(request: Request, response: Response): Promise<void> {
    const { title, currency, price, trialDays } = request.body;

    const plan = await planApplicationInteractor.create({ title, currency, price, trialDays });

    const presenter = new ExpressPresenter(response);

    presenter.returnNewEntity(plan);
  }

  @withErrorHandler
  static async update(request: Request, response: Response): Promise<void> {
    const { planId } = request.params;
    const { title, currency, price, trialDays } = request.body;

    await planApplicationInteractor.update({ id: planId, title, currency, price, trialDays });

    const presenter = new ExpressPresenter(response);

    presenter.returnOk();
  }

  @withErrorHandler
  static async delete(request: Request, response: Response): Promise<void> {
    const { planId } = request.params;

    await planApplicationInteractor.delete(planId);

    const presenter = new ExpressPresenter(response);

    presenter.returnOk();
  }
}

export default PlanCommandsController;
