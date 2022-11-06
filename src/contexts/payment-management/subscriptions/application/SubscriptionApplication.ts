import { EventBus } from '../../../../framework';
import { StudentId } from '../../student-billing-profiles/domain/Student';
import CardService from '../domain/CardService';
import CardDoesNotExistError from '../domain/errors/CardDoesNotExistError';
import PlanDoesNotExistError from '../domain/errors/PlanDoesNotExistError';
import SubscriptionCreated from '../domain/events/SubscriptionCreated';
import PlanService from '../domain/PlanService';
import ProviderSubscriptionService from '../domain/ProviderSubscriptionService';
import Subscription from '../domain/Subscription';
import SubscriptionFactory from '../domain/SubscriptionFactory';
import SubscriptionRepository from '../domain/SubscriptionRepository';

type CreateInput = {
  studentId: StudentId;
  planId: string;
  cardId: string;
};

class SubscriptionApplication {
  constructor(
    private planService: PlanService,
    private cardService: CardService,
    private providerSubscriptionService: ProviderSubscriptionService,
    private subscriptionRepository: SubscriptionRepository,
    private eventBus: EventBus,
  ) {}

  async create({ studentId, planId, cardId }: CreateInput): Promise<Subscription> {
    const [plan, card] = await Promise.all([this.planService.getById(planId), this.cardService.getById(cardId)]);

    if (!plan) {
      throw new PlanDoesNotExistError(planId);
    }

    if (!card) {
      throw new CardDoesNotExistError(cardId);
    }

    /**
     * we don't validate if the studentId exists because this value comes from the credential.
     * It's not an User input
     */

    const providerSubscription = await this.providerSubscriptionService.create({ plan, card });

    const subscription = SubscriptionFactory.create({
      studentId,
      providerSubscription,
      plan,
      card,
    });

    const { id } = await this.subscriptionRepository.add(subscription);

    subscription.id = id;

    await this.eventBus.publish(new SubscriptionCreated(subscription));

    return subscription;
  }
}

export default SubscriptionApplication;
