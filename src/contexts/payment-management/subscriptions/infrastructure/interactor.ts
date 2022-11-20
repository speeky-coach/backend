import { syncEventBus } from '../../../../framework';
import SubscriptionApplication from '../application/SubscriptionApplication';
import { mercadoPagoProviderSubscriptionService } from './MercadoPagoProviderSubscriptionService';
import { firestoreCardService } from './FirestoreCardService';
import { firestorePlanService } from './FirestorePlanService';
import { firestoreSubscriptionRepository } from './FirestoreSubscriptionRepository';

const interactor = new SubscriptionApplication(
  firestorePlanService,
  firestoreCardService,
  mercadoPagoProviderSubscriptionService,
  firestoreSubscriptionRepository,
  syncEventBus,
);

export default interactor;
