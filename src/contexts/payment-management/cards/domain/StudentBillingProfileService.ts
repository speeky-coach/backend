import { StudentId } from '../../student-billing-profiles/domain/Student';
import StudentBillingProfile from '../../student-billing-profiles/domain/StudentBillingProfile';

interface StudentBillingProfileService {
  getById(studentId: StudentId): Promise<StudentBillingProfile | null>;
}

export default StudentBillingProfileService;
