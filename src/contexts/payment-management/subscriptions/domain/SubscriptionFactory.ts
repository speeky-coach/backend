import Card from '../../cards/domain/Card';
import Plan from '../../plans/domain/Plan';
import { StudentId } from '../../student-billing-profiles/domain/Student';
import { ProviderSubscription } from './ProviderSubscriptionService';
import Subscription, { SubscriptionStatus } from './Subscription';

const SUBSCRIPTION_CHARGE_INITIAlIZATION = 0;

type CreateInput = {
  studentId: StudentId;
  providerSubscription: ProviderSubscription;
  plan: Plan;
  card: Card;
};

class SubscriptionFactory {
  static create({ studentId, providerSubscription, plan, card }: CreateInput): Omit<Subscription, 'id'> {
    const now = new Date();

    const subscription: Omit<Subscription, 'id'> = {
      providerSubscriptionId: providerSubscription.id,
      studentId: studentId,
      planId: plan.id,
      cardId: card.id,
      status: SubscriptionStatus.ACTIVE,
      trialStart: providerSubscription.trialStart,
      trialEnd: providerSubscription.trialEnd,
      charges: SUBSCRIPTION_CHARGE_INITIAlIZATION,
      nextBillingDate: providerSubscription.nextBillingDate,
      canceledAt: null,
      endedAt: null,
      createdAt: now,
      updatedAt: now,
    };

    return subscription;
  }
}

export default SubscriptionFactory;
