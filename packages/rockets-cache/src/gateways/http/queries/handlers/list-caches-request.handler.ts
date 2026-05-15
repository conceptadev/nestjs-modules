import { CrudListHandler } from '@concepta/rockets-crud';

import { CacheInterface } from '../../../../domain/interfaces/cache.interface';

export class ListCachesRequestHandler extends CrudListHandler<CacheInterface> {}
