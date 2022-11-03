import { Request, Response } from 'express';
import { ExpressPresenter, withErrorHandler } from '../../../../framework';
import studentBillingProfileApplicationInteractor from '../application/studentBillingProfileApplicationInteractor';

class StudentBillingProfileCommandsController {
  @withErrorHandler
  static async create(request: Request, response: Response): Promise<void> {
    const { studentId, address, city, country, phone } = request.body;

    const studentBillingProfile = await studentBillingProfileApplicationInteractor.create({
      studentId,
      address,
      city,
      country,
      phone,
    });

    const presenter = new ExpressPresenter(response);

    presenter.returnNewEntity(studentBillingProfile);
  }
}

export default StudentBillingProfileCommandsController;
