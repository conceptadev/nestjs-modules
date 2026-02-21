import { CacheInterface } from '@concepta/nestjs-common';
import { CrudListQuery } from '@concepta/nestjs-crud';

export class ListCachesRequest extends CrudListQuery<CacheInterface> {}
