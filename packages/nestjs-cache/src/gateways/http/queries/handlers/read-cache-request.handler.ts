import { CrudReadHandler } from '@concepta/nestjs-crud';

import { type CacheInterface } from '../../../../domain/interfaces/cache.interface';

export class ReadCacheRequestHandler extends CrudReadHandler<CacheInterface> {}
