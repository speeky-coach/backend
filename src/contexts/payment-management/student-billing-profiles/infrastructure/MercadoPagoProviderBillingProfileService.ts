import mercadoPagoClient from '../../../../setup/mercadoPago';
import ProviderBillingProfileService, {
  CreateInput,
  ProviderBillingProfile,
} from '../domain/ProviderBillingProfileService';

interface MercadoPagoCustomer {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: Phone;
  identification: Identification;
  address: PurpleAddress;
  description: string;
  date_created: Date;
  metadata: Metadata;
  default_address: string;
  cards: AddressElement[];
  addresses: AddressElement[];
  live_mode: boolean;
}

interface PurpleAddress {
  id: string;
  zip_code: string;
  street_name: string;
}

interface AddressElement {}

interface Identification {
  type: string;
  number: number;
}

interface Metadata {
  source_sync: string;
}

interface Phone {
  area_code: number;
  number: number;
}

interface MercadoPagoCustomerResponse {
  data: MercadoPagoCustomer;
  status: number;
}

class MercadoPagoProviderBillingProfileService implements ProviderBillingProfileService {
  public async create(input: CreateInput): Promise<ProviderBillingProfile> {
    const payload = {
      email: input.email,
      first_name: input.name,
      last_name: input.lastname,
      phone: {
        area_code: input.phone.countryCode,
        number: input.phone.areaCode + input.phone.number,
      },
      identification: {
        type: input.identityDocument.type,
        number: input.identityDocument.number,
      },
      default_address: 'Home',
      address: {
        // id: '123123',
        zip_code: input.address.zipCode,
        street_name: input.address.street,
        street_number: input.address.number,
      },
      date_registered: new Date(),
      description: input.email,
      default_card: 'None',
    };

    const { data }: MercadoPagoCustomerResponse = await mercadoPagoClient.post('/v1/customers', payload);

    const providerBillingProfile: ProviderBillingProfile = {
      id: data.id,
    };

    return providerBillingProfile;
  }
}

export const mercadoPagoProviderBillingProfileService = new MercadoPagoProviderBillingProfileService();

export default MercadoPagoProviderBillingProfileService;
