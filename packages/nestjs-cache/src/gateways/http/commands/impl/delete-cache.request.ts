import { CrudDeleteCommand } from '@concepta/nestjs-crud';

import { type CacheInterface } from '../../../../domain/interfaces/cache.interface';

export class DeleteCacheRequest extends CrudDeleteCommand<CacheInterface> {}
