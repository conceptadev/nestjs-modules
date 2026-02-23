import { DynamicModule, Module } from '@nestjs/common';

import { createOtpRepositoryProvider } from './infrastructure/utils/create-otp-repository-provider';
import { OtpCoreModuleClass } from './otp-core.module-definition';
import { OtpAsyncOptions, OtpOptions } from './otp.module-definition';

/**
 * Otp Module
 */
@Module({})
export class OtpModule {
  static register(options: OtpOptions): DynamicModule {
    return {
      module: OtpModule,
      imports: [OtpCoreModuleClass.register({ ...options, global: false })],
    };
  }

  static registerAsync(options: OtpAsyncOptions): DynamicModule {
    return {
      module: OtpModule,
      imports: [
        OtpCoreModuleClass.registerAsync({ ...options, global: false }),
      ],
    };
  }

  static forRoot(options: OtpOptions): DynamicModule {
    return {
      module: OtpModule,
      imports: [OtpCoreModuleClass.register({ ...options, global: true })],
    };
  }

  static forRootAsync(options: OtpAsyncOptions): DynamicModule {
    return {
      module: OtpModule,
      imports: [OtpCoreModuleClass.registerAsync({ ...options, global: true })],
    };
  }

  static forFeature(entityKeys: string[]): DynamicModule {
    const providers = entityKeys.map((entityKey) =>
      createOtpRepositoryProvider(entityKey),
    );

    return {
      module: OtpModule,
      providers,
      exports: providers,
    };
  }
}
