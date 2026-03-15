import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { CacheRepositoryResolverInterface } from '../../domain/repositories/cache-repository-resolver.interface';
import { CacheRepositoryInterface } from '../../domain/repositories/cache-repository.interface';
import { CacheEntityNotFoundException } from '../exceptions/cache-entity-not-found.exception';
import { getDynamicCacheRepositoryToken } from '../utils/create-cache-repository-provider';

@Injectable()
export class CacheRepositoryResolver
  implements CacheRepositoryResolverInterface
{
  constructor(private readonly moduleRef: ModuleRef) {}

  resolve(entityKey: string): CacheRepositoryInterface {
    const token = getDynamicCacheRepositoryToken(entityKey);

    try {
      return this.moduleRef.get<CacheRepositoryInterface>(token, {
        strict: false,
      });
    } catch {
      throw new CacheEntityNotFoundException(entityKey);
    }
  }
}
