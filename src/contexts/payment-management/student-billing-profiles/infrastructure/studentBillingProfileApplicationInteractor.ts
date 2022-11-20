import { mercadoPagoProviderBillingProfileService } from './MercadoPagoProviderBillingProfileService';
import { firebaseStudentService } from './FirebaseStudentService';
import { firestoreStudentBillingProfileRepository } from './FirestoreStudentBillingProfileRepository';
import StudentBillingProfileApplication from '../application/StudentBillingProfileApplication';

const studentBillingProfileApplicationInteractor = new StudentBillingProfileApplication(
  firebaseStudentService,
  firestoreStudentBillingProfileRepository,
  mercadoPagoProviderBillingProfileService,
);

export default studentBillingProfileApplicationInteractor;
