import { CrudUpdateCommand } from '@concepta/nestjs-crud';

import { type CacheUpdatableInterface } from '../../../../domain/interfaces/cache-updatable.interface';
import { type CacheInterface } from '../../../../domain/interfaces/cache.interface';

export class UpdateCacheRequest extends CrudUpdateCommand<
  CacheInterface,
  CacheUpdatableInterface
> {}
