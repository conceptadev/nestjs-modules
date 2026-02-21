import {
  CacheInterface,
  CacheUpdatableInterface,
} from '@concepta/nestjs-common';
import { CrudUpdateCommand } from '@concepta/nestjs-crud';

export class UpdateCacheRequest extends CrudUpdateCommand<
  CacheInterface,
  CacheUpdatableInterface
> {}
