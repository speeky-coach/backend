import { StudentId } from '../../student-billing-profiles/domain/Student';
import { StudentBillingProfileId } from '../../student-billing-profiles/domain/StudentBillingProfile';

export type CardId = string;

interface Card {
  id: CardId;
  studentId: StudentId;
  studentBillingProfileId: StudentBillingProfileId;
  providerCardId: string;
  lastDigits: string;
  brand: string;
  createdAt: Date;
  updatedAt: Date;
}

export default Card;
