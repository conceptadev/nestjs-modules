import { CrudCreateCommand } from '@concepta/nestjs-crud';

import { CacheCreatableInterface } from '../../../../domain/interfaces/cache-creatable.interface';
import { CacheInterface } from '../../../../domain/interfaces/cache.interface';

export class CreateCacheRequest extends CrudCreateCommand<
  CacheInterface,
  CacheCreatableInterface
> {}
