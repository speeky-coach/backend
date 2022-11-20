import { StudentId } from './Student';

export type StudentBillingProfileId = string;

interface StudentBillingProfile {
  id: StudentBillingProfileId;
  studentId: StudentId;
  providerBillingProfileId: string;
  identityDocument: {
    type: string;
    number: string;
  };
  address: {
    street: string;
    number: string;
    floor: string;
    apartment: string;
    city: string;
    country: string;
    zipCode: string;
  };
  phone: {
    countryCode: string;
    areaCode: string;
    number: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export default StudentBillingProfile;
