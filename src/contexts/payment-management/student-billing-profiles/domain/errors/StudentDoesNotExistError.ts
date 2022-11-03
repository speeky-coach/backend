import { NotFoundDomainError } from '../../../../../framework';
import { StudentId } from '../Student';

class StudentDoesNotExistError extends NotFoundDomainError {
  code: string = 'ERROR_STUDENT_BILLING_PROFILE_001';

  constructor(studentId: StudentId) {
    super(`Does not exist a student with ID: ${studentId}`);
  }
}

export default StudentDoesNotExistError;
