import { CardId } from '../../cards/domain/Card';
import { PlanId } from '../../plans/domain/Plan';
import { StudentId } from '../../student-billing-profiles/domain/Student';
import { ProviderSubscriptionId } from './ProviderSubscriptionService';

export type SubscriptionId = string;

export enum SubscriptionStatus {
  ACTIVE,
  PAUSED,
  CANCELED,
}

interface Subscription {
  id: SubscriptionId;
  providerSubscriptionId: ProviderSubscriptionId;
  studentId: StudentId;
  planId: PlanId;
  cardId: CardId;
  status: SubscriptionStatus;
  trialStart: Date | null;
  trialEnd: Date | null;
  charges: number;
  nextBillingDate: Date;
  canceledAt: Date | null;
  endedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export default Subscription;
