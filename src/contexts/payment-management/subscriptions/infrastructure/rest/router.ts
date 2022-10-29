import express from 'express';
import axios from 'axios';
// import UserController from './UserController';

// const userController = new UserController();

interface StudentProviderProfile {
  object: string;
  id: string;
  creation_date: number;
  email: string;
  antifraud_details: {
    first_name: string;
    last_name: string;
    address: string;
    address_city: string;
    country_code: string;
    phone: string;
    object: string;
  };
  metadata: any;
}

interface CardProvider {
  object: string;
  id: string;
  creation_date: number;
  customer_id: string;
  source: {
    active: boolean;
    card_number: string;
    email: string;
    id: string;
    last_four: string;
    object: string;
    type: string;
  };
  metadata: any;
}

const router = express.Router();

router.post('/payment-management/subscriptions', async (request, response, next) => {
  try {
    const { studentId, tokenPayment } = request.body;

    const paymentClient = axios.create({
      baseURL: 'https://api.culqi.com/v2',
      headers: {
        'Content-type': 'application/json',
        Authorization: 'Bearer sk_test_MbR7S7h3PEETdQoB',
      },
    });

    let studentProviderProfileId = 'cus_test_0YQ8zSpSJKfBLyRu'; // await getStudentProviderProfileId(studentId)

    if (!studentProviderProfileId) {
      const createCustomerResult = await paymentClient.post('/customers', {
        first_name: 'Richard',
        last_name: 'Hendricks',
        email: 'richard@piedpiper.com',
        address: 'San Francisco Bay Area',
        address_city: 'Palo Alto',
        country_code: 'US',
        phone_number: '6505434800',
      });

      if (createCustomerResult.status !== 201) {
        throw new Error('Create customer payment failed');
      }

      const studentProviderProfile: StudentProviderProfile = createCustomerResult.data;

      // save(studentProviderProfile)

      studentProviderProfileId = studentProviderProfile.id;
    }

    const createCardResult = await paymentClient.post('/cards', {
      customer_id: studentProviderProfileId,
      token_id: tokenPayment,
    });

    if (createCardResult.status !== 201) {
      throw new Error('Create card payment failed');
    }

    const cardProvider: CardProvider = createCardResult.data;

    response.json({});
  } catch (error) {
    next(error);
  }
});

export default router;
