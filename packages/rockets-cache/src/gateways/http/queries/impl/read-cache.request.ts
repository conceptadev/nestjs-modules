import { CrudReadQuery } from '@concepta/rockets-crud';

import { CacheInterface } from '../../../../domain/interfaces/cache.interface';

export class ReadCacheRequest extends CrudReadQuery<CacheInterface> {}
