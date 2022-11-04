import culqiClient from '../../../../setup/culqi';
import ProviderCardService, { CreateInput, ProviderCard } from '../domain/ProviderCardService';

interface CulqiCard {
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
}

interface CulqiCardResponse {
  data: CulqiCard;
  status: number;
}

class CulqiProviderCardService implements ProviderCardService {
  public async create({ studentBillingProfile, providerTokenId }: CreateInput): Promise<ProviderCard> {
    const payload = {
      customer_id: studentBillingProfile.providerBillingProfileId,
      token_id: providerTokenId,
    };

    const { data }: CulqiCardResponse = await culqiClient.post('/cards', payload);

    const providerCard: ProviderCard = {
      id: data.id,
      lastDigits: data.source.last_four,
      brand: data.source.iin.card_brand,
    };

    return providerCard;
  }
}

export const culqiProviderCardService = new CulqiProviderCardService();

export default CulqiProviderCardService;
