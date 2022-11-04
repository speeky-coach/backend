import { firestoreDb } from '../../../../framework';
import { StudentId } from '../../student-billing-profiles/domain/Student';
import StudentBillingProfile from '../../student-billing-profiles/domain/StudentBillingProfile';
import StudentBillingProfileService from '../domain/StudentBillingProfileService';

const COLLECTION_NAME = 'customer-billing-profiles';

class FirestoreStudentBillingProfileService implements StudentBillingProfileService {
  public async getById(studentId: StudentId): Promise<StudentBillingProfile | null> {
    const snapshot = await firestoreDb.collection(COLLECTION_NAME).where('studentId', '==', studentId).get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs.at(0)!;

    const data = doc.data();

    const studentBillingProfile = {
      ...data,
      id: doc.id,
      createdAt: new Date(data.createdAt._seconds * 1000),
      updatedAt: new Date(data.updatedAt._seconds * 1000),
    } as StudentBillingProfile;

    return studentBillingProfile;
  }
}

export const firestoreStudentBillingProfileService = new FirestoreStudentBillingProfileService();

export default FirestoreStudentBillingProfileService;
