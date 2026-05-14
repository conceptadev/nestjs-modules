import { DomainMapper } from '@concepta/rockets-app/aggregate';

import { Cache } from '../../domain/aggregates/cache';
import { CacheInterface } from '../../domain/interfaces/cache.interface';

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
