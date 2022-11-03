import { StudentId } from './Student';
import StudentBillingProfile from './StudentBillingProfile';

export type AddInput = Pick<
  StudentBillingProfile,
  'studentId' | 'providerBillingProfileId' | 'address' | 'city' | 'country' | 'phone'
>;

interface StudentBillingProfileRepository {
  doesExist(studentId: StudentId): Promise<boolean>;
  add(input: AddInput): Promise<StudentBillingProfile>;
}

export default StudentBillingProfileRepository;
