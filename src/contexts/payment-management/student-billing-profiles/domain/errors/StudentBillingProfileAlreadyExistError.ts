import { BadUserInputDomainError } from '../../../../../framework';
import { StudentId } from '../Student';

class StudentBillingProfileAlreadyExistError extends BadUserInputDomainError {
  code: string = 'ERROR_STUDENT_BILLING_PROFILE_002';

  constructor(studentId: StudentId) {
    super(`The student with ID: ${studentId} already has a Billing Profile`);
  }
}

export default StudentBillingProfileAlreadyExistError;
