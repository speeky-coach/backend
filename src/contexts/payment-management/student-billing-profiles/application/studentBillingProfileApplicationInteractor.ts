import { culqiProviderBillingProfileService } from '../infrastructure/CulqiProviderBillingProfileService';
import { firebaseStudentService } from '../infrastructure/FirebaseStudentService';
import { firestoreStudentBillingProfileRepository } from '../infrastructure/FirestoreStudentBillingProfileRepository';
import StudentBillingProfileApplication from './StudentBillingProfileApplication';

const studentBillingProfileApplicationInteractor = new StudentBillingProfileApplication(
  firebaseStudentService,
  firestoreStudentBillingProfileRepository,
  culqiProviderBillingProfileService,
);

export default studentBillingProfileApplicationInteractor;
