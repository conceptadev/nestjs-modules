import { CrudReplaceCommand } from '@concepta/rockets-crud';

import { CacheCreatableInterface } from '../../../../domain/interfaces/cache-creatable.interface';
import { CacheInterface } from '../../../../domain/interfaces/cache.interface';

export class ReplaceCacheRequest extends CrudReplaceCommand<
  CacheInterface,
  CacheCreatableInterface
> {}
