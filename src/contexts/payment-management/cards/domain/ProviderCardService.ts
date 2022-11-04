import StudentBillingProfile from '../../student-billing-profiles/domain/StudentBillingProfile';

export type ProviderCardId = string;

export interface ProviderCard {
  id: ProviderCardId;
  lastDigits: string;
  brand: string;
}

export type CreateInput = {
  studentBillingProfile: StudentBillingProfile;
  providerTokenId: string;
};

interface ProviderCardService {
  create(input: CreateInput): Promise<ProviderCard>;
}

export default ProviderCardService;
