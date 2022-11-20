import StudentBillingProfile from './StudentBillingProfile';

export type ProviderBillingProfileId = string;

export interface ProviderBillingProfile {
  id: ProviderBillingProfileId;
}

export type CreateInput = {
  name: string;
  lastname: string;
  email: string;
} & Pick<StudentBillingProfile, 'identityDocument' | 'address' | 'phone'>;

interface ProviderBillingProfileService {
  create(input: CreateInput): Promise<ProviderBillingProfile>;
}

export default ProviderBillingProfileService;
