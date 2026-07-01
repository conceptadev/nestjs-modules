import { CrudReplaceCommand } from '@concepta/nestjs-crud';

import { type CacheCreatableInterface } from '../../../../domain/interfaces/cache-creatable.interface';
import { type CacheInterface } from '../../../../domain/interfaces/cache.interface';

export class ReplaceCacheRequest extends CrudReplaceCommand<
  CacheInterface,
  CacheCreatableInterface
> {}
