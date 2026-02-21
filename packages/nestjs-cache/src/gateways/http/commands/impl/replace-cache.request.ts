import {
  CacheCreatableInterface,
  CacheInterface,
} from '@concepta/nestjs-common';
import { CrudReplaceCommand } from '@concepta/nestjs-crud';

export class ReplaceCacheRequest extends CrudReplaceCommand<
  CacheInterface,
  CacheCreatableInterface
> {}
