import Student, { StudentId } from '../domain/Student';
import StudentService from '../domain/StudentService';

class FirebaseStudentService implements StudentService {
  public async getById(studentId: StudentId): Promise<Student> {
    const student: Student = {
      id: studentId, // '1a153ad7-58e5-4c5c-bd41-342433df4aed',
      name: 'Grover',
      lastname: 'Lee',
      email: 'grover.lee@gmail.com',
    };

    return student;
  }
}

export const firebaseStudentService = new FirebaseStudentService();

export default FirebaseStudentService;
