import { CrudListHandler } from '@concepta/nestjs-crud';

import { type CacheInterface } from '../../../../domain/interfaces/cache.interface';

export class ListCachesRequestHandler extends CrudListHandler<CacheInterface> {}
