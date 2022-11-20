import StudentBillingProfileAlreadyExistError from '../domain/errors/StudentBillingProfileAlreadyExistError';
import StudentDoesNotExistError from '../domain/errors/StudentDoesNotExistError';
import ProviderBillingProfileService from '../domain/ProviderBillingProfileService';
import StudentBillingProfile from '../domain/StudentBillingProfile';
import StudentBillingProfileRepository from '../domain/StudentBillingProfileRepository';
import StudentService from '../domain/StudentService';

type CreateInput = Pick<StudentBillingProfile, 'studentId' | 'identityDocument' | 'address' | 'phone'>;

class StudentBillingProfileApplication {
  constructor(
    private studentService: StudentService,
    private studentBillingProfileRepository: StudentBillingProfileRepository,
    private providerBillingProfileService: ProviderBillingProfileService,
  ) {}

  async create({ studentId, identityDocument, address, phone }: CreateInput): Promise<StudentBillingProfile> {
    const student = await this.studentService.getById(studentId);

    if (!student) {
      throw new StudentDoesNotExistError(studentId);
    }

    const doesExist = await this.studentBillingProfileRepository.doesExist(studentId);

    if (doesExist) {
      throw new StudentBillingProfileAlreadyExistError(studentId);
    }

    const providerBillingProfileInput = {
      name: student.name,
      lastname: student.lastname,
      email: student.email,
      identityDocument,
      address,
      phone,
    };

    const providerBillingProfile = await this.providerBillingProfileService.create(providerBillingProfileInput);

    const studentBillingProfileInput = {
      studentId,
      providerBillingProfileId: providerBillingProfile.id,
      identityDocument,
      address,
      phone,
    };

    const studentBillingProfile = await this.studentBillingProfileRepository.add(studentBillingProfileInput);

    return studentBillingProfile;
  }
}

export default StudentBillingProfileApplication;
