import { StudentId } from '../../student-billing-profiles/domain/Student';
import Card from '../domain/Card';
import CardRepository from '../domain/CardRepository';
import StudentBillingProfileDoesNotExistError from '../domain/errors/StudentBillingProfileDoesNotExistError';
import ProviderCardService from '../domain/ProviderCardService';
import StudentBillingProfileService from '../domain/StudentBillingProfileService';

type CreateInput = {
  studentId: StudentId;
  providerTokenId: string;
};

class CardApplication {
  constructor(
    private cardRepository: CardRepository,
    private studentBillingProfileService: StudentBillingProfileService,
    private providerCardService: ProviderCardService,
  ) {}

  async create({ studentId, providerTokenId }: CreateInput): Promise<Card> {
    const studentBillingProfile = await this.studentBillingProfileService.getById(studentId);

    if (!studentBillingProfile) {
      throw new StudentBillingProfileDoesNotExistError(studentId);
    }

    const providerCard = await this.providerCardService.create({ studentBillingProfile, providerTokenId });

    const cardInput = {
      studentId,
      studentBillingProfileId: studentBillingProfile.id,
      providerCardId: providerCard.id,
      lastDigits: providerCard.lastDigits,
      brand: providerCard.brand,
    };

    const card = await this.cardRepository.add(cardInput);

    return card;
  }
}

export default CardApplication;
