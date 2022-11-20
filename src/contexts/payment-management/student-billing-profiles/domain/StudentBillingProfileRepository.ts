import { StudentId } from './Student';
import StudentBillingProfile from './StudentBillingProfile';

export type AddInput = Pick<
  StudentBillingProfile,
  'studentId' | 'providerBillingProfileId' | 'identityDocument' | 'address' | 'phone'
>;

interface StudentBillingProfileRepository {
  doesExist(studentId: StudentId): Promise<boolean>;
  add(input: AddInput): Promise<StudentBillingProfile>;
}

export default StudentBillingProfileRepository;
