import { CrudDeleteCommand } from '@concepta/rockets-crud';

import { CacheInterface } from '../../../../domain/interfaces/cache.interface';

export class DeleteCacheRequest extends CrudDeleteCommand<CacheInterface> {}
