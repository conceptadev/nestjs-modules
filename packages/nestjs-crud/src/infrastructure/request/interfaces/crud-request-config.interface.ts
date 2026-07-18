import { type PlainLiteralObject, type Type } from '@nestjs/common';

import { type CrudValidationOptions } from '../../../crud.types.js';
import { type CrudParamsOptionsInterface } from '../../interfaces/crud-params-options.interface.js';

/**
 * Request configuration for CRUD operations.
 *
 * Used at controller level to set defaults, and at route level for overrides.
 */
export interface CrudRequestConfig<T extends PlainLiteralObject> {
  /**
   * URL parameter configuration for entity identification.
   */
  params?: CrudParamsOptionsInterface<T>;

  /**
   * DTO type for single-entity request bodies.
   */
  body?: Type;

  /**
   * DTO type for batch request bodies.
   */
  bodyBatch?: Type;

  /**
   * Validation options for request processing.
   */
  validation?: CrudValidationOptions<T>;
}
