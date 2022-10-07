import DomainEvent from './DomainEvent';
import EventBus from './EventBus';

class EventBusMock implements EventBus {
  public events: DomainEvent[] = [];

  public async publish(events: DomainEvent | DomainEvent[]): Promise<void> {
    this.events = Array.isArray(events) ? events : [events];
  }
}

export default EventBusMock;
