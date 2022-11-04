import Card from './Card';

export type AddInput = Pick<Card, 'studentId' | 'studentBillingProfileId' | 'providerCardId' | 'lastDigits' | 'brand'>;

interface CardRepository {
  add(input: AddInput): Promise<Card>;
}

export default CardRepository;
