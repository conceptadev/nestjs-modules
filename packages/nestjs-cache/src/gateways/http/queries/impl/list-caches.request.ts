import { CrudListQuery } from '@concepta/nestjs-crud';

import { type CacheInterface } from '../../../../domain/interfaces/cache.interface';

export class ListCachesRequest extends CrudListQuery<CacheInterface> {}
