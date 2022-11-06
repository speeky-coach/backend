import { syncEventBus } from '../../../../framework';
import SubscriptionApplication from '../application/SubscriptionApplication';
import { culqiProviderSubscriptionService } from './CulqiProviderSubscriptionService';
import { firestoreCardService } from './FirestoreCardService';
import { firestorePlanService } from './FirestorePlanService';
import { firestoreSubscriptionRepository } from './FirestoreSubscriptionRepository';

const interactor = new SubscriptionApplication(
  firestorePlanService,
  firestoreCardService,
  culqiProviderSubscriptionService,
  firestoreSubscriptionRepository,
  syncEventBus,
);

export default interactor;
