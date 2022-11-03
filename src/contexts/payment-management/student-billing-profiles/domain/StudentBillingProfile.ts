import { StudentId } from './Student';

export type StudentBillingProfileId = string;

interface StudentBillingProfile {
  id: StudentBillingProfileId;
  studentId: StudentId;
  providerBillingProfileId: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

export default StudentBillingProfile;
