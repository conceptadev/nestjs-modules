import { applyDecorators, PlainLiteralObject, Post } from '@nestjs/common';

import { Operation } from '@concepta/rockets-app';

import { CrudCreateBatchHandler } from '../../../application/commands/handlers/crud-create-batch.handler';
import { CrudCreateBatchCommand } from '../../../application/commands/impl/crud-create-batch.command';
import { CRUD_MODULE_ROUTE_CREATE_MANY_DEFAULT_PATH } from '../../../crud.constants';
import { CrudValidationOptions } from '../../../crud.types';
import { CrudRouteCommandOptionsInterface } from '../../interfaces/crud-route-ctlr-options.interface';
import { getTransactionalDecorators } from '../../utils/get-transactional-decorators';
import { CrudApiBody } from '../openapi/crud-api-body.decorator';
import { CrudApiOperation } from '../openapi/crud-api-operation.decorator';
import { CrudApiResponse } from '../openapi/crud-api-response.decorator';
import { CrudCommandHandler } from '../routes/crud-command-handler.decorator';
import { CrudCommand } from '../routes/crud-command.decorator';
import { CrudOperation } from '../routes/crud-operation.decorator';
import { CrudSerialize } from '../routes/crud-serialize.decorator';
import { CrudValidate } from '../routes/crud-validate.decorator';

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
