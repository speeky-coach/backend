import { v4 as uuid } from 'uuid';

abstract class DomainEvent {
  static EVENT_NAME: string;

  readonly eventName: string;
  readonly entityId: string | number;
  readonly eventId: string;
  readonly occurredOn: Date;

  constructor(eventName: string, entityId: string | number) {
    this.eventName = eventName;
    this.entityId = entityId;
    this.eventId = uuid();
    this.occurredOn = new Date();
  }
}

export default DomainEvent;
