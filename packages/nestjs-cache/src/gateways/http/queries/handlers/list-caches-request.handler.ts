import { CacheInterface } from '@concepta/nestjs-common';
import { CrudListHandler } from '@concepta/nestjs-crud';

export class ListCachesRequestHandler extends CrudListHandler<CacheInterface> {}
