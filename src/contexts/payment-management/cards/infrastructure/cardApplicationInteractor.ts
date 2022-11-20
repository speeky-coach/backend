import CardApplication from '../application/CardApplication';
import { mercadoPagoProviderCardService } from './MercadoPagoProviderCardService';
import { firestoreCardRepository } from './FirestoreCardRepository';
import { firestoreStudentBillingProfileService } from './FirestoreStudentBillingProfileService';

const cardApplicationInteractor = new CardApplication(
  firestoreCardRepository,
  firestoreStudentBillingProfileService,
  mercadoPagoProviderCardService,
);

export default cardApplicationInteractor;
