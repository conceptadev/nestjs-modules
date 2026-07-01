import { CrudReadQuery } from '@concepta/nestjs-crud';

import { type CacheInterface } from '../../../../domain/interfaces/cache.interface';

export class ReadCacheRequest extends CrudReadQuery<CacheInterface> {}
