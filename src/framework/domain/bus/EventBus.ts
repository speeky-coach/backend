import DomainEvent from './DomainEvent';

interface EventBus {
  publish(events: DomainEvent | DomainEvent[]): Promise<void>;
}

export default EventBus;
