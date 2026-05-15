import { CrudReadHandler } from '@concepta/rockets-crud';

import { CacheInterface } from '../../../../domain/interfaces/cache.interface';

export class ReadCacheRequestHandler extends CrudReadHandler<CacheInterface> {}
