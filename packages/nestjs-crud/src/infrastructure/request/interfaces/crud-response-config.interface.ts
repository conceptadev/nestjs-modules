import { Type } from '@nestjs/common';

import { CrudSerializationOptionsInterface } from '../../interfaces/crud-serialization-options.interface';

/**
 * Response configuration for CRUD operations.
 *
 * Used at controller level to set defaults, and at route level for overrides.
 */
export interface CrudResponseConfig {
  /**
   * DTO type for single resource responses.
   */
  resource?: Type;

  /**
   * DTO type for collection responses (future use when de-paginate is supported).
   */
  collection?: Type;

  /**
   * DTO type for paginated responses.
   */
  paginated?: Type;

  /**
   * Serialization options for response transformation.
   */
  serialization?: CrudSerializationOptionsInterface;

  /**
   * Return the deleted entity in delete/soft delete responses.
   */
  returnDeleted?: boolean;

  /**
   * Return the restored entity in restore responses.
   */
  returnRestored?: boolean;
}
