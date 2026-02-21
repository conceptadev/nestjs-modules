import {
  CacheCreatableInterface,
  CacheInterface,
} from '@concepta/nestjs-common';
import { CrudCreateCommand } from '@concepta/nestjs-crud';

export class CreateCacheRequest extends CrudCreateCommand<
  CacheInterface,
  CacheCreatableInterface
> {}
