import mercadoPagoClient from '../../../../setup/mercadoPago';
import ProviderCardService, { CreateInput, ProviderCard } from '../domain/ProviderCardService';

/* interface MercadoPagoCard {
  object: 'card';
  id: string;
  date: number;
  customer_id: string;
  source: {
    object: 'token';
    id: string;
    type: 'card';
    creation_date: number;
    card_number: string;
    last_four: string;
    active: true;
    iin: {
      object: string;
      bin: string;
      card_brand: string;
      card_type: string;
      card_category: string;
      issuer: {
        name: string;
        country: string;
        country_code: string;
        website: any;
        phone_number: any;
      };
      installments_allowed: number[];
    };
    client: {
      ip: string;
      ip_country: string;
      ip_country_code: string;
      browser: any;
      device_fingerprint: any;
      device_type: any;
    };
  };
  metadata: {};
} */

interface MercadoPagoCard {
  id: number;
  expiration_month: number;
  expiration_year: number;
  first_six_digits: number;
  last_four_digits: number;
  payment_method: PaymentMethod;
  security_code: SecurityCode;
  issuer: Issuer;
  cardholder: Cardholder;
  date_created: Date;
  date_last_updated: Date;
  customer_id: string;
  user_id: number;
  live_mode: boolean;
}

interface Cardholder {
  name: string;
  identification: Identification;
}

interface Identification {
  number: number;
  type: string;
}

interface Issuer {
  id: number;
  name: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  payment_type_id: string;
  thumbnail: string;
  secure_thumbnail: string;
}

interface SecurityCode {
  length: number;
  card_location: string;
}

interface MercadoPagoCardResponse {
  data: MercadoPagoCard;
  status: number;
}

class MercadoPagoProviderCardService implements ProviderCardService {
  public async create({ studentBillingProfile, providerTokenId }: CreateInput): Promise<ProviderCard> {
    const customerId = studentBillingProfile.providerBillingProfileId;

    const payload = {
      token: providerTokenId,
    };

    const { data }: MercadoPagoCardResponse = await mercadoPagoClient.post(
      `/v1/customers/${customerId}/cards`,
      payload,
    );

    const providerCard: ProviderCard = {
      id: data.id.toString(),
      lastDigits: data.last_four_digits.toString(),
      brand: data.issuer.name,
    };

    return providerCard;
  }
}

export const mercadoPagoProviderCardService = new MercadoPagoProviderCardService();

export default MercadoPagoProviderCardService;
