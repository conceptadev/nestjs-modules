import { DynamicModule, Type } from '@nestjs/common';

import { CacheRepositoryInterface } from '../../../domain/repositories/cache-repository.interface';

export interface CacheExtrasInterface extends Pick<DynamicModule, 'global'> {
  repositories?: {
    cache?: Type<CacheRepositoryInterface>;
  };
}
