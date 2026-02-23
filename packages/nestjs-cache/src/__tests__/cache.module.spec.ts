import { Test, TestingModule } from '@nestjs/testing';

import { CacheModule } from '../cache.module';
import { CacheRepositoryResolver } from '../infrastructure/persistence/cache-repository.resolver';
import { CacheRepository } from '../infrastructure/persistence/cache.repository';

import { AppModuleFixture } from './fixtures/app.module.fixture';

describe(CacheModule.name, () => {
  let cacheModule: CacheModule;

  beforeEach(async () => {
    const testModule: TestingModule = await Test.createTestingModule({
      imports: [AppModuleFixture],
    }).compile();

    cacheModule = testModule.get<CacheModule>(CacheModule);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('module', () => {
    it('should be loaded', async () => {
      expect(cacheModule).toBeInstanceOf(CacheModule);
    });
  });

  describe('register', () => {
    it('should return a dynamic module', () => {
      const result = CacheModule.register({});
      expect(result.module).toBe(CacheModule);
      expect(result.imports).toHaveLength(1);
    });
  });

  describe('registerAsync', () => {
    it('should return a dynamic module', () => {
      const result = CacheModule.registerAsync({});
      expect(result.module).toBe(CacheModule);
      expect(result.imports).toHaveLength(1);
    });
  });

  describe('forRoot', () => {
    it('should return a global dynamic module', () => {
      const result = CacheModule.forRoot({});
      expect(result.module).toBe(CacheModule);
      expect(result.imports).toHaveLength(1);
    });
  });

  describe('forRootAsync', () => {
    it('should return a global dynamic module', () => {
      const result = CacheModule.forRootAsync({});
      expect(result.module).toBe(CacheModule);
      expect(result.imports).toHaveLength(1);
    });
  });

  describe('forFeature', () => {
    it('should return providers for each entity key', () => {
      const result = CacheModule.forFeature(['userCache', 'sessionCache']);
      expect(result.module).toBe(CacheModule);
      expect(result.providers).toHaveLength(2);
      expect(result.exports).toHaveLength(2);
    });

    it('should resolve CacheRepository via CacheRepositoryResolver', async () => {
      const testModule: TestingModule = await Test.createTestingModule({
        imports: [AppModuleFixture],
      }).compile();

      const resolver = testModule.get(CacheRepositoryResolver);
      const repo = resolver.resolve('userCache');

      expect(repo).toBeInstanceOf(CacheRepository);
    });
  });
});
