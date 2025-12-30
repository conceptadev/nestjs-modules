import { PlainLiteralObject, Type } from '@nestjs/common';

import { CrudAdapter } from '../crud/adapters/crud.adapter';
import { CrudControllerOptionsInterface } from '../crud/interfaces/crud-controller-options.interface';
import { CrudExtraDecoratorsInterface } from '../crud/interfaces/crud-extra-decorators.interface';
import { CrudService } from '../services/crud.service';
import { ConfigurableCrudOptions } from '../util/interfaces/configurable-crud-options.interface';

import { CrudModuleOptionsInterface } from './crud-module-options.interface';

/**
 * Controller configuration type - either a class or config object for ConfigurableCrudBuilder
 */
type CrudForFeatureControllerOption<Entity extends PlainLiteralObject> =
  | Type
  | (CrudControllerOptionsInterface<Entity> & CrudExtraDecoratorsInterface);

/**
 * Common configuration options shared by all CRUD feature variants
 */
interface CrudForFeatureCommonOptions<Entity extends PlainLiteralObject>
  extends Omit<ConfigurableCrudOptions<Entity>, 'service' | 'controller'> {
  /**
   * The entity class
   */
  entity: Type<Entity>;

  /**
   * Controller - either a class or config object for ConfigurableCrudBuilder
   */
  controller: CrudForFeatureControllerOption<Entity>;

  /**
   * Optional custom service class extending CrudService
   */
  service?: Type<CrudService<Entity>>;
}

/**
 * Configuration with adapter - generates service if not provided
 */
interface CrudForFeatureWithAdapterOptions<Entity extends PlainLiteralObject>
  extends CrudForFeatureCommonOptions<Entity> {
  /**
   * The CRUD adapter class to use (e.g., TypeOrmCrudAdapter)
   */
  adapter: Type<CrudAdapter<Entity>>;
}

/**
 * Configuration with service only - no adapter needed
 * Use when service is self-contained and doesn't need an adapter
 */
interface CrudForFeatureWithServiceOptions<Entity extends PlainLiteralObject>
  extends CrudForFeatureCommonOptions<Entity> {
  /**
   * Adapter not allowed when using service-only config
   */
  adapter?: undefined;

  /**
   * Required custom service class (since no adapter to generate one)
   */
  service: Type<CrudService<Entity>>;
}

/**
 * Configuration options for CRUD feature registration
 * Either adapter or service must be provided
 */
type CrudForFeatureCrudsOption<
  Entity extends PlainLiteralObject = PlainLiteralObject,
> =
  | CrudForFeatureWithAdapterOptions<Entity>
  | CrudForFeatureWithServiceOptions<Entity>;

/**
 * Infer Entity type from config and resolve to CrudForFeatureCrudsOption
 */
type CrudForFeatureCrudsOptionInfer<T> = T extends {
  entity: Type<infer E extends PlainLiteralObject>;
}
  ? CrudForFeatureCrudsOption<E>
  : never;

/**
 * Base constraint for forFeature configurations (allows inference)
 */
export interface CrudForFeatureCrudsOptionInterface
  extends Partial<
    Omit<ConfigurableCrudOptions<PlainLiteralObject>, 'service' | 'controller'>
  > {
  entity: Type;
  adapter?: Type;
  service?: Type;
  controller: CrudForFeatureControllerOption<PlainLiteralObject>;
}

/**
 * Options for CrudModule.forFeature
 * Uses inference to validate each config against CrudModuleForFeatureCrudsOption
 */
export interface CrudModuleForFeatureOptionsInterface<
  TCruds extends Record<string, CrudForFeatureCrudsOptionInterface>,
> extends CrudModuleOptionsInterface {
  /**
   * CRUD configurations keyed by entity key
   * Each config is validated against CrudModuleForFeatureCrudsOption with inferred Entity
   */
  cruds?: {
    [K in keyof TCruds]: CrudForFeatureCrudsOptionInfer<TCruds[K]>;
  };
}
