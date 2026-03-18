import { CacheInterface } from '@concepta/nestjs-common';
import { DomainMapper } from '@concepta/nestjs-common/aggregate';

import { Cache } from '../../domain/aggregates/cache';

import { CacheEntityInterface } from './interfaces/cache-entity.interface';

export class CacheMapper extends DomainMapper<
  CacheEntityInterface,
  CacheInterface,
  Cache
> {
  createAggregate(entity: CacheEntityInterface): Cache {
    const { id, version, dateCreated, dateUpdated, dateDeleted, ...props } =
      entity;

    return new Cache(id, props, version, {
      dateCreated,
      dateUpdated,
      dateDeleted,
    });
  }
}
