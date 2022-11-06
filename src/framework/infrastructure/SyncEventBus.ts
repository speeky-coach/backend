import { DomainEvent, EventBus } from '../domain';

class SyncEventBus implements EventBus {
  public async publish(events: DomainEvent | DomainEvent[]): Promise<void> {}
}

export const syncEventBus = new SyncEventBus();

export default SyncEventBus;
