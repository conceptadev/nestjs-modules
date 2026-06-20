import { DynamicModule, Module } from '@nestjs/common';

import {
  RocketsAppAsyncOptions,
  RocketsAppModuleClass,
  RocketsAppOptions,
} from './rockets-app.module-definition';

@Module({})
export class RocketsAppModule extends RocketsAppModuleClass {
  static register(options: RocketsAppOptions): DynamicModule {
    return super.register(options);
  }

  static registerAsync(options: RocketsAppAsyncOptions): DynamicModule {
    return super.registerAsync(options);
  }

  static forRoot(options: RocketsAppOptions = {}): DynamicModule {
    return super.register({ ...options, global: true });
  }

  static forRootAsync(options: RocketsAppAsyncOptions): DynamicModule {
    return super.registerAsync({ ...options, global: true });
  }
}
