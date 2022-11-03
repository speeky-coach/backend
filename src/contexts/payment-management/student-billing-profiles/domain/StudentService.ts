import Student, { StudentId } from './Student';

interface StudentService {
  getById(studentId: StudentId): Promise<Student>;
}

export default StudentService;
