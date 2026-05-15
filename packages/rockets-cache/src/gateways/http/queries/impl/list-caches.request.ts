import { CrudListQuery } from '@concepta/rockets-crud';

import { CacheInterface } from '../../../../domain/interfaces/cache.interface';

export class ListCachesRequest extends CrudListQuery<CacheInterface> {}
