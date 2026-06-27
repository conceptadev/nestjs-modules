import {
  type ControllerOptions,
  type PlainLiteralObject,
  type Type,
} from '@nestjs/common';

import { type CrudAdapterProvider } from '../adapters/interfaces/crud-adapter.types';
import { type CrudRequestConfig } from '../request/interfaces/crud-request-config.interface';
import { type CrudResponseConfig } from '../request/interfaces/crud-response-config.interface';
import { type CrudResolverInterface } from '../resolvers/interfaces/crud-resolver.interface';

import { type CrudControllerEntityInterface } from './crud-controller-entity.interface';
import { type CrudTransactionalInterface } from './crud-transactional.interface';

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
  extends
    ControllerOptions,
    CrudControllerEntityInterface,
    CrudTransactionalInterface {
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
