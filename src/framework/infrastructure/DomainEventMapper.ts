import DomainEvent from '../domain/bus/DomainEvent';
import DomainEventDTO from './DomainEventDTO';

interface DomainEventMapper<D extends DomainEvent, T extends DomainEventDTO> {
  toDTO(domainEvent: D): T;
}

export default DomainEventMapper;
