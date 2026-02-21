import { ModuleRef } from '@nestjs/core';

import { CacheEntityNotFoundException } from '../../exceptions/cache-entity-not-found.exception';
import { CacheRepositoryResolver } from '../cache-repository.resolver';
import { CacheRepository } from '../cache.repository';

describe(CacheRepositoryResolver.name, () => {
  let resolver: CacheRepositoryResolver;
  let mockModuleRef: jest.Mocked<ModuleRef>;

  beforeEach(() => {
    mockModuleRef = {
      get: jest.fn(),
    } as unknown as jest.Mocked<ModuleRef>;

    resolver = new CacheRepositoryResolver(mockModuleRef);
  });

  it('should return a CacheRepository when found', () => {
    const mockRepo = {} as CacheRepository;
    mockModuleRef.get.mockReturnValue(mockRepo);

    const result = resolver.resolve('UserCache');

    expect(result).toBe(mockRepo);
  });

  it('should throw CacheEntityNotFoundException when not found', () => {
    mockModuleRef.get.mockImplementation(() => {
      throw new Error('not found');
    });

    expect(() => resolver.resolve('Missing')).toThrow(
      CacheEntityNotFoundException,
    );
  });
});
