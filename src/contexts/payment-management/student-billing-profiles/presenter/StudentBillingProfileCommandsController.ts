import { Request, Response } from 'express';
import { ExpressPresenter, withErrorHandler } from '../../../../framework';
import studentBillingProfileApplicationInteractor from '../infrastructure/studentBillingProfileApplicationInteractor';

class StudentBillingProfileCommandsController {
  @withErrorHandler
  static async create(request: Request, response: Response): Promise<void> {
    const { studentId, identityDocument, address, phone } = request.body;

    const studentBillingProfile = await studentBillingProfileApplicationInteractor.create({
      studentId,
      identityDocument,
      address,
      phone,
    });

    const presenter = new ExpressPresenter(response);

    presenter.returnNewEntity(studentBillingProfile);
  }
}

export default StudentBillingProfileCommandsController;
