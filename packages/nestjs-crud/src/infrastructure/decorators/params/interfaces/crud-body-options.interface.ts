import { type z } from 'zod';

import {
  type PipeTransform,
  type PlainLiteralObject,
  type Type,
} from '@nestjs/common';

import { type CrudValidationOptions } from '../../../../crud.types.js';

export interface CrudBodyOptionsInterface<
  T extends PlainLiteralObject = PlainLiteralObject,
> {
  /**
   * Options merged into the `StandardSchemaValidationPipe` used to
   * validate `schema` — see `CrudOptionsInterface.validation`. Overrides
   * any controller/operation-level default.
   */
  validation?: CrudValidationOptions<T>;
  pipes?: (Type<PipeTransform> | PipeTransform)[];
  /**
   * The schema to validate the body against — consumed by
   * `crud-init-validation.decorator.ts` via
   * `Body({ schema, pipes: [new StandardSchemaValidationPipe(...)] })`.
   * When omitted, the body is still bound but never validated.
   */
  schema?: z.ZodType;
}
