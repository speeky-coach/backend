import culqiClient from '../../../../setup/culqi';
import ProviderBillingProfileService, {
  CreateInput,
  ProviderBillingProfile,
} from '../domain/ProviderBillingProfileService';

interface CulqiCustomer {
  object: 'customer';
  id: string;
  creation_date: number;
  email: string;
  antifraud_details: {
    country_code: string;
    first_name: string;
    last_name: string;
    address_city: string;
    address: string;
    phone: string;
    object: 'client';
  };
  metadata: {};
}

interface CulqiCustomerResponse {
  data: CulqiCustomer;
  status: number;
}

class CulqiProviderBillingProfileService implements ProviderBillingProfileService {
  public async create(input: CreateInput): Promise<ProviderBillingProfile> {
    const payload = {
      first_name: input.name,
      last_name: input.lastname,
      email: input.email,
      address: input.address,
      address_city: input.city,
      country_code: input.country,
      phone_number: input.phone,
    };

    const createCulqiPlanResponse: CulqiCustomerResponse = await culqiClient.post('/customers', payload);

    const providerBillingProfile: ProviderBillingProfile = {
      id: createCulqiPlanResponse.data.id,
    };

    return providerBillingProfile;
  }
}

export const culqiProviderBillingProfileService = new CulqiProviderBillingProfileService();

export default CulqiProviderBillingProfileService;
