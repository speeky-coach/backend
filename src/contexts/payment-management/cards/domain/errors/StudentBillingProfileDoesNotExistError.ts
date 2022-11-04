import { NotFoundDomainError } from '../../../../../framework';
import { StudentId } from '../../../student-billing-profiles/domain/Student';

class StudentBillingProfileDoesNotExistError extends NotFoundDomainError {
  code: string = 'ERROR_CARD_001';

  constructor(studentId: StudentId) {
    super(`Does not exist a student billing profile with the student ID: ${studentId}`);
  }
}

export default StudentBillingProfileDoesNotExistError;
