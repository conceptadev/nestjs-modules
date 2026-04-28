import { applyDecorators } from '@nestjs/common';

import { CrudInitApiBody } from './crud-init-api-body.decorator';
import { CrudInitApiParams } from './crud-init-api-params.decorator';
import { CrudInitApiQuery } from './crud-init-api-query.decorator';
import { CrudInitApiResponse } from './crud-init-api-response.decorator';
import { CrudInitCommand } from './crud-init-command.decorator';
import { CrudInitQuery } from './crud-init-query.decorator';
import { CrudInitSerialization } from './crud-init-serialization.decorator';
import { CrudInitValidation } from './crud-init-validation.decorator';

/**
 * CRUD controller initialization decorator.
 *
 * Runs all init decorators that resolve metadata and apply NestJS decorators.
 * Can be re-run safely after metadata changes (e.g., by ConfigurableCrudBuilder).
 */
export const CrudInit = () =>
  applyDecorators(
    CrudInitValidation(),
    CrudInitSerialization(),
    CrudInitQuery(),
    CrudInitCommand(),
    CrudInitApiBody(),
    CrudInitApiQuery(),
    CrudInitApiParams(),
    CrudInitApiResponse(),
  );
