import { type PlainLiteralObject } from '@nestjs/common';

import { type ReferenceIdInterface } from '../reference/interfaces/reference-id.interface';
import { type ReferenceVersionInterface } from '../reference/interfaces/reference-version.interface';

import { type DomainAggregate } from './domain-aggregate';
import { type AggregateMetaInterface } from './interfaces/aggregate-meta.interface';

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
