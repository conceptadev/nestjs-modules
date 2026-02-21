import { CacheInterface } from '@concepta/nestjs-common';
import { CrudReadQuery } from '@concepta/nestjs-crud';

export class ReadCacheRequest extends CrudReadQuery<CacheInterface> {}
