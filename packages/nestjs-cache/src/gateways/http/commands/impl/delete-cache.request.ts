import { CacheInterface } from '@concepta/nestjs-common';
import { CrudDeleteCommand } from '@concepta/nestjs-crud';

export class DeleteCacheRequest extends CrudDeleteCommand<CacheInterface> {}
