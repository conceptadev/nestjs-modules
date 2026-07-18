import {
  applyDecorators,
  Patch,
  type PlainLiteralObject,
} from '@nestjs/common';

import { Operation } from '@concepta/nestjs-core';

import { CrudUpdateHandler } from '../../../application/commands/handlers/crud-update.handler.js';
import { CrudUpdateCommand } from '../../../application/commands/impl/crud-update.command.js';
import { CRUD_MODULE_ROUTE_ID_DEFAULT_PATH } from '../../../crud.constants.js';
import { type CrudValidationOptions } from '../../../crud.types.js';
import { type CrudRouteCommandOptionsInterface } from '../../interfaces/crud-route-ctlr-options.interface.js';
import { getTransactionalDecorators } from '../../utils/get-transactional-decorators.js';
import { CrudApiBody } from '../openapi/crud-api-body.decorator.js';
import { CrudApiOperation } from '../openapi/crud-api-operation.decorator.js';
import { CrudApiParam } from '../openapi/crud-api-param.decorator.js';
import { CrudApiResponse } from '../openapi/crud-api-response.decorator.js';
import { CrudCommandHandler } from '../routes/crud-command-handler.decorator.js';
import { CrudCommand } from '../routes/crud-command.decorator.js';
import { CrudOperation } from '../routes/crud-operation.decorator.js';
import { CrudSerialize } from '../routes/crud-serialize.decorator.js';
import { CrudValidate } from '../routes/crud-validate.decorator.js';

/**
 * CRUD Update route decorator
 */
export const CrudUpdate = <T extends PlainLiteralObject = PlainLiteralObject>(
  options: CrudRouteCommandOptionsInterface<T> = {},
) => {
  const {
    path = CRUD_MODULE_ROUTE_ID_DEFAULT_PATH,
    command,
    commandHandler,
    request,
    response,
    api,
    transactional,
  } = { ...options };

  const bodyDto = request?.body;
  const validation: CrudValidationOptions<T> = bodyDto
    ? { ...request?.validation, expectedType: bodyDto }
    : request?.validation;

  return applyDecorators(
    Patch(path),
    CrudOperation(Operation.Update),
    CrudCommand<T>({ command, commandTemplate: CrudUpdateCommand }),
    CrudCommandHandler<T>({
      handler: commandHandler,
      handlerTemplate: CrudUpdateHandler<T>,
    }),
    CrudValidate(validation),
    CrudSerialize(response?.serialization),
    CrudApiOperation(api?.operation),
    CrudApiParam(api?.params),
    CrudApiBody({
      type: bodyDto,
      ...api?.body,
    }),
    CrudApiResponse(api?.response),
    ...getTransactionalDecorators(transactional),
  );
};
