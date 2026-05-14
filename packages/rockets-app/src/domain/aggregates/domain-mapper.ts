import { PlainLiteralObject } from '@nestjs/common';

import { ReferenceIdInterface } from '../reference/interfaces/reference-id.interface';
import { ReferenceVersionInterface } from '../reference/interfaces/reference-version.interface';

import { DomainAggregate } from './domain-aggregate';
import { AggregateMetaInterface } from './interfaces/aggregate-meta.interface';

export abstract class DomainMapper<
  Entity,
  Props extends PlainLiteralObject,
  A extends DomainAggregate<Props>,
> {
  abstract createAggregate(
    entity: Entity &
      ReferenceIdInterface &
      ReferenceVersionInterface &
      AggregateMetaInterface,
  ): A;

  toDomain(
    entity: Entity &
      ReferenceIdInterface &
      ReferenceVersionInterface &
      AggregateMetaInterface,
  ): A {
    return this.createAggregate(entity);
  }

  toPersistence(aggregate: A) {
    return aggregate.toPlain();
  }
}
