import { CrudReadQuery } from '@concepta/nestjs-crud';

import { CacheInterface } from '../../../../domain/interfaces/cache.interface';

export class ReadCacheRequest extends CrudReadQuery<CacheInterface> {}
