import { CrudUpdateCommand } from '@concepta/rockets-crud';

import { CacheUpdatableInterface } from '../../../../domain/interfaces/cache-updatable.interface';
import { CacheInterface } from '../../../../domain/interfaces/cache.interface';

export class UpdateCacheRequest extends CrudUpdateCommand<
  CacheInterface,
  CacheUpdatableInterface
> {}
