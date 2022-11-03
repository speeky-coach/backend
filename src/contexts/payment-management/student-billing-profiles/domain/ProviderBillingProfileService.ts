export type ProviderBillingProfileId = string;

export interface ProviderBillingProfile {
  id: ProviderBillingProfileId;
}

export type CreateInput = {
  name: string;
  lastname: string;
  email: string;
  address: string;
  city: string;
  country: string;
  phone: string;
};

interface ProviderBillingProfileService {
  create(input: CreateInput): Promise<ProviderBillingProfile>;
}

export default ProviderBillingProfileService;
