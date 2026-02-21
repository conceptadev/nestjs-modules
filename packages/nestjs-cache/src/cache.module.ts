import { DynamicModule, Module } from '@nestjs/common';

import { CacheCoreModuleClass } from './cache-core.module-definition';
import { CacheAsyncOptions, CacheOptions } from './cache.module-definition';
import { createCacheRepositoryProvider } from './infrastructure/utils/create-cache-repository-provider';

/**
 * Cache Module
 */
@Module({})
export class CacheModule {
  static register(options: CacheOptions): DynamicModule {
    return {
      module: CacheModule,
      imports: [CacheCoreModuleClass.register(options)],
    };
  }

  static registerAsync(options: CacheAsyncOptions): DynamicModule {
    return {
      module: CacheModule,
      imports: [CacheCoreModuleClass.registerAsync(options)],
    };
  }

  static forRoot(options: CacheOptions): DynamicModule {
    return this.register(options);
  }

  static forRootAsync(options: CacheAsyncOptions): DynamicModule {
    return this.registerAsync(options);
  }

  static forFeature(entityKeys: string[]): DynamicModule {
    const providers = entityKeys.map((entityKey) =>
      createCacheRepositoryProvider(entityKey),
    );

    return {
      module: CacheModule,
      providers,
      exports: providers,
    };
  }
}
