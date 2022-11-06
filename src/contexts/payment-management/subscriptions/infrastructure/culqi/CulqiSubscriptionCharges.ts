interface CulqiSubscriptionCharges {
  duplicated: boolean | null;
  object: 'charge';
  id: string;
  creation_date: number;
  amount: number;
  amount_refunded: number;
  current_amount: number;
  installments: number;
  installments_amount: number | null;
  currency_code: string;
  email: string;
  description: string;
  source: {
    object: 'token';
    id: string;
    type: string;
    creation_date: number;
    email: string;
    card_number: string;
    last_four: string;
    active: boolean;
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
        website: string | null;
        phone_number: string | null;
      };
      installments_allowed: any[];
    };
    client: {
      ip: string;
      ip_country: string;
      ip_country_code: string;
      browser: string | null;
      device_fingerprint: any | null;
      device_type: string;
    };
    metadata: {};
  };
  outcome: {
    type: string;
    code: string;
    merchant_message: string;
    user_message: string;
  };
  fraud_score: any | null;
  antifraud_details: {
    first_name: string;
    last_name: string;
    address: string;
    address_city: string;
    country_code: string;
    phone: string;
    object: string;
  };
  dispute: boolean;
  capture: any | null;
  reference_code: string;
  authorization_code: string;
  metadata: {};
  total_fee: number;
  fee_details: {
    fixed_fee: {};
    variable_fee: {
      currency_code: string;
      commision: number;
      total: number;
    };
  };
  total_fee_taxes: number;
  transfer_amount: number;
  paid: boolean;
  statement_descriptor: string;
  transfer_id: any | null;
  capture_date: any | null;
}

export default CulqiSubscriptionCharges;
