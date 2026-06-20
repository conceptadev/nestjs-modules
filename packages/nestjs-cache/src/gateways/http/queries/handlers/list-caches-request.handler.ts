import { CrudListHandler } from '@concepta/nestjs-crud';

import { CacheInterface } from '../../../../domain/interfaces/cache.interface';

export class ListCachesRequestHandler extends CrudListHandler<CacheInterface> {}
