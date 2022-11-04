import CardApplication from '../application/CardApplication';
import { culqiProviderCardService } from './CulqiProviderCardService';
import { firestoreCardRepository } from './FirestoreCardRepository';
import { firestoreStudentBillingProfileService } from './FirestoreStudentBillingProfileService';

const cardApplicationInteractor = new CardApplication(
  firestoreCardRepository,
  firestoreStudentBillingProfileService,
  culqiProviderCardService,
);

export default cardApplicationInteractor;
