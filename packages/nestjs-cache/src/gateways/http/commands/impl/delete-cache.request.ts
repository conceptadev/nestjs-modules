import { CrudDeleteCommand } from '@concepta/nestjs-crud';

import { CacheInterface } from '../../../../domain/interfaces/cache.interface';

export class DeleteCacheRequest extends CrudDeleteCommand<CacheInterface> {}
