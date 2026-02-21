import { Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

import { CacheEntityNotFoundException } from '../exceptions/cache-entity-not-found.exception';
import { getDynamicCacheRepositoryToken } from '../utils/create-cache-repository-provider';

import { CacheRepository } from './cache.repository';

@Injectable()
export class CacheRepositoryResolver {
  constructor(private readonly moduleRef: ModuleRef) {}

  resolve(entityKey: string): CacheRepository {
    const token = getDynamicCacheRepositoryToken(entityKey);

    try {
      return this.moduleRef.get<CacheRepository>(token, { strict: false });
    } catch {
      throw new CacheEntityNotFoundException(entityKey);
    }
  }
}
