import { CrudUpdateCommand } from '@concepta/nestjs-crud';

import { CacheUpdatableInterface } from '../../../../domain/interfaces/cache-updatable.interface';
import { CacheInterface } from '../../../../domain/interfaces/cache.interface';

export class UpdateCacheRequest extends CrudUpdateCommand<
  CacheInterface,
  CacheUpdatableInterface
> {}
