import { Request, Response } from 'express';
import { ExpressPresenter, withErrorHandler } from '../../../../framework';
import cardApplicationInteractor from '../infrastructure/cardApplicationInteractor';

class CardCommandsController {
  @withErrorHandler
  static async create(request: Request, response: Response): Promise<void> {
    const { studentId, providerTokenId } = request.body;

    const card = await cardApplicationInteractor.create({ studentId, providerTokenId });

    const presenter = new ExpressPresenter(response);

    presenter.returnNewEntity(card);
  }
}

export default CardCommandsController;
