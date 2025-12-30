import { DynamicModule, Module, Provider, Type } from '@nestjs/common';

import {
  createCrudExports,
  createCrudImports,
  createCrudProviders,
  CrudAsyncOptions,
  CrudModuleClass,
  CrudOptions,
} from './crud.module-definition';
import {
  CrudForFeatureCrudsOptionInterface,
  CrudModuleForFeatureOptionsInterface,
} from './interfaces/crud-module-for-feature-options.interface';
import { ConfigurableCrudBuilder } from './util/configurable-crud.builder';
import { createCrudAdapterProvider } from './util/create-crud-adapter-provider';
import { createCrudServiceProvider } from './util/create-crud-service-provider';
import { getDynamicCrudAdapterToken } from './util/inject-dynamic-crud-adapter.decorator';
import { getDynamicCrudServiceToken } from './util/inject-dynamic-crud-service.decorator';

@Module({})
export class CrudModule extends CrudModuleClass {
  static register(options: CrudOptions): DynamicModule {
    return super.register(options);
  }

  static registerAsync(options: CrudAsyncOptions): DynamicModule {
    return super.registerAsync(options);
  }

  static forRoot(options: CrudOptions): DynamicModule {
    return super.register({ ...options, global: true });
  }

  static forRootAsync(options: CrudAsyncOptions): DynamicModule {
    return super.registerAsync({ ...options, global: true });
  }

  static forFeature<
    TCruds extends Record<string, CrudForFeatureCrudsOptionInterface>,
  >(options: CrudModuleForFeatureOptionsInterface<TCruds>): DynamicModule {
    const providers: Provider[] = [];
    const controllers: Type[] = [];

    // Create adapter, service, and controller for each CRUD configuration
    if (options.cruds) {
      for (const [entityKey, config] of Object.entries(options.cruds)) {
        const { adapter, service, controller } = config;

        // Handle controller configuration
        if ('model' in controller) {
          // Controller config object - use ConfigurableCrudBuilder for service AND controller

          // Create adapter provider (only if adapter provided)
          if (adapter) {
            providers.push(
              createCrudAdapterProvider({
                entityKey,
                adapter,
              }),
            );
          }

          const adapterToken = getDynamicCrudAdapterToken(entityKey);
          const serviceToken = getDynamicCrudServiceToken(entityKey);

          const {
            getMany,
            getOne,
            createMany,
            createOne,
            updateOne,
            replaceOne,
            deleteOne,
            recoverOne,
          } = config;

          // Build service config - use service if provided, otherwise adapter token
          const serviceConfig = service
            ? { serviceToken, useClass: service }
            : { serviceToken, adapterToken };

          const builder = new ConfigurableCrudBuilder({
            service: serviceConfig,
            controller,
            getMany,
            getOne,
            createMany,
            createOne,
            updateOne,
            replaceOne,
            deleteOne,
            recoverOne,
          });
          const { ConfigurableControllerClass, ConfigurableServiceProvider } =
            builder.build();
          providers.push(ConfigurableServiceProvider);
          controllers.push(ConfigurableControllerClass);
        } else {
          // Custom controller class - use createCrudServiceProvider

          // Create adapter provider (only if adapter provided)
          if (adapter) {
            providers.push(
              createCrudAdapterProvider({
                entityKey,
                adapter,
              }),
            );
          }

          // Create service provider
          if (service) {
            providers.push(
              createCrudServiceProvider({
                entityKey,
                useClass: service,
              }),
            );
          } else if (adapter) {
            providers.push(
              createCrudServiceProvider({
                entityKey,
              }),
            );
          }

          controllers.push(controller);
        }
      }
    }

    return {
      module: CrudModule,
      imports: createCrudImports(options),
      providers: [...providers, ...createCrudProviders({ overrides: options })],
      controllers,
      exports: [...providers, ...createCrudExports()],
    };
  }
}
