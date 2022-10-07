import AggregateRoot from '../domain/entities/AggregateRoot';
import DomainEvent from '../domain/bus/DomainEvent';
import EntityDTO from './EntityDTO';

interface EntityMapper<D extends AggregateRoot | DomainEvent, T extends EntityDTO> {
  toDTO(domainEntity: D): T;
  toDomain(dto: T): D;
}

export default EntityMapper;
