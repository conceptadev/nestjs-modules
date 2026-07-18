import { applyDecorators, type PlainLiteralObject, Post } from '@nestjs/common';

import { Operation } from '@concepta/nestjs-core';

import { CrudCreateBatchHandler } from '../../../application/commands/handlers/crud-create-batch.handler.js';
import { CrudCreateBatchCommand } from '../../../application/commands/impl/crud-create-batch.command.js';
import { CRUD_MODULE_ROUTE_CREATE_MANY_DEFAULT_PATH } from '../../../crud.constants.js';
import { type CrudValidationOptions } from '../../../crud.types.js';
import { type CrudRouteCommandOptionsInterface } from '../../interfaces/crud-route-ctlr-options.interface.js';
import { getTransactionalDecorators } from '../../utils/get-transactional-decorators.js';
import { CrudApiBody } from '../openapi/crud-api-body.decorator.js';
import { CrudApiOperation } from '../openapi/crud-api-operation.decorator.js';
import { CrudApiResponse } from '../openapi/crud-api-response.decorator.js';
import { CrudCommandHandler } from '../routes/crud-command-handler.decorator.js';
import { CrudCommand } from '../routes/crud-command.decorator.js';
import { CrudOperation } from '../routes/crud-operation.decorator.js';
import { CrudSerialize } from '../routes/crud-serialize.decorator.js';
import { CrudValidate } from '../routes/crud-validate.decorator.js';

/**
 * CRUD Create Batch route decorator
 */
export const CrudCreateBatch = <
  T extends PlainLiteralObject = PlainLiteralObject,
>(
  options: CrudRouteCommandOptionsInterface<T> = {},
) => {
  const {
    path = CRUD_MODULE_ROUTE_CREATE_MANY_DEFAULT_PATH,
    command: command,
    commandHandler: commandHandler,
    request,
    response,
    api,
    transactional,
  } = { ...options };

  const bodyBatchDto = request?.bodyBatch;
  const validation: CrudValidationOptions<T> = bodyBatchDto
    ? { ...request?.validation, expectedType: bodyBatchDto }
    : request?.validation;

  return applyDecorators(
    Post(path),
    CrudOperation(Operation.CreateBatch),
    CrudCommand<T>({
      command: command,
      commandTemplate: CrudCreateBatchCommand,
    }),
    CrudCommandHandler<T>({
      handler: commandHandler,
      handlerTemplate: CrudCreateBatchHandler,
    }),
    CrudValidate(validation),
    CrudSerialize(response?.serialization),
    CrudApiOperation(api?.operation),
    CrudApiBody({
      type: bodyBatchDto,
      ...api?.body,
    }),
    CrudApiResponse(api?.response),
    ...getTransactionalDecorators(transactional),
  );
};
