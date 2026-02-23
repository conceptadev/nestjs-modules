import { PlainLiteralObject } from '@nestjs/common';

import {
  CrudControllerClassOptionsInterface,
  CrudControllerOptionsInterface,
} from '../../interfaces/crud-controller-options.interface';
import { CrudOperationOptions } from '../crud-operation-options.type';

import { CrudExtraDecoratorsInterface } from './crud-extra-decorators.interface';

/**
 * Options for pre-decorated controller class.
 * Operations are read from class metadata.
 */
export interface ConfigurableCrudClassOptions {
  controller: CrudControllerClassOptionsInterface &
    CrudExtraDecoratorsInterface;
}

/**
 * Options for hybrid controller class with operations.
 *
 * The class provides the base controller, and operations define which methods
 * to augment or create:
 * - If method exists with matching operation → augment/override its options
 * - If method doesn't exist → create new method with implementation + decorators
 */
export interface ConfigurableCrudHybridOptions<
  Entity extends PlainLiteralObject,
> {
  controller: CrudControllerClassOptionsInterface &
    CrudExtraDecoratorsInterface;
  operations: CrudOperationOptions<Entity>[];
}

/**
 * Options for generated controller.
 * Operations array defines what methods to generate.
 */
export interface ConfigurableCrudGeneratedOptions<
  Entity extends PlainLiteralObject,
> {
  controller: CrudControllerOptionsInterface<Entity> &
    CrudExtraDecoratorsInterface;
  operations: CrudOperationOptions<Entity>[];
}

/**
 * Options for configurable CRUD builder.
 *
 * Either:
 * - Pre-decorated class: `{ controller: { class: MyController } }`
 * - Hybrid class + operations: `{ controller: { class: MyController }, operations: [...] }`
 * - Generated controller: `{ controller: { entity: ..., adapter: ... }, operations: [...] }`
 */
export type ConfigurableCrudOptions<Entity extends PlainLiteralObject> =
  | ConfigurableCrudClassOptions
  | ConfigurableCrudHybridOptions<Entity>
  | ConfigurableCrudGeneratedOptions<Entity>;
