import { ControllerOptions, PlainLiteralObject, Type } from '@nestjs/common';

import { CrudAdapterProvider } from './crud-adapter-provider.interface';
import { CrudControllerDomainInterface } from './crud-controller-domain.interface';
import { CrudRequestConfig } from './crud-request-config.interface';
import { CrudResolverInterface } from './crud-resolver.interface';
import { CrudResponseConfig } from './crud-response-config.interface';

/**
 * Controller options for pre-decorated class path (build() with class).
 *
 * Use this when you have an already-decorated controller class.
 * The builder will only add missing CQRS metadata.
 *
 * Adapter is read from class metadata (`@CrudController` decorator).
 */
export interface CrudControllerClassOptionsInterface {
  /**
   * Pre-decorated controller class.
   * Must have `@CrudController` and operation decorators already applied.
   */
  class: Type;
}

/**
 * Controller options for builder-generated controllers.
 *
 * Use this when you want the builder to generate a controller class.
 */
export interface CrudControllerOptionsInterface<T extends PlainLiteralObject>
  extends ControllerOptions,
    CrudControllerDomainInterface {
  /**
   * Adapter provider for CRUD operations.
   * Defaults to CrudAdapter.
   */
  adapter?: CrudAdapterProvider<T>;

  /**
   * Resolver class for dispatching operations.
   * Defaults to CrudAdapterResolver (calls adapter directly).
   */
  resolver?: Type<CrudResolverInterface>;

  /**
   * Request configuration (params, body DTOs, validation).
   */
  request?: CrudRequestConfig<T>;

  /**
   * Response configuration (resource DTOs, serialization).
   */
  response?: CrudResponseConfig;
}
