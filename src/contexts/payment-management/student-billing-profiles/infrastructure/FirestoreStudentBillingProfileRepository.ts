import { firestoreDb } from '../../../../framework';
import StudentBillingProfile from '../domain/StudentBillingProfile';
import StudentBillingProfileRepository, { AddInput } from '../domain/StudentBillingProfileRepository';

const COLLECTION_NAME = 'customer-billing-profiles';

class FirestoreStudentBillingProfileRepository implements StudentBillingProfileRepository {
  public async doesExist(studentId: string): Promise<boolean> {
    const doc = await firestoreDb.collection(COLLECTION_NAME).where('studentId', '==', studentId).get();

    return !doc.empty;
  }

  public async add(input: AddInput): Promise<StudentBillingProfile> {
    const createdAt = new Date();
    const updatedAt = new Date();

    const response = await firestoreDb.collection(COLLECTION_NAME).add({ ...input, createdAt, updatedAt });

    const studentBillingProfile: StudentBillingProfile = {
      ...input,
      id: response.id,
      createdAt,
      updatedAt,
    };

    return studentBillingProfile;
  }
}

export const firestoreStudentBillingProfileRepository = new FirestoreStudentBillingProfileRepository();

export default FirestoreStudentBillingProfileRepository;
