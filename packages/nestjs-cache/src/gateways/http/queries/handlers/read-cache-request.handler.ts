import { CacheInterface } from '@concepta/nestjs-common';
import { CrudReadHandler } from '@concepta/nestjs-crud';

export class ReadCacheRequestHandler extends CrudReadHandler<CacheInterface> {}
