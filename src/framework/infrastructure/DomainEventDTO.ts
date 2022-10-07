interface DomainEventDTO {
  data: any;
  readonly eventName: string;
  readonly entityId: string;
  readonly eventId: string;
  readonly occurredOn: Date;
}

export default DomainEventDTO;
