import { applyDecorators, PlainLiteralObject, Post } from '@nestjs/common';

import { Operation } from '@concepta/rockets-app';

import { CrudCreateHandler } from '../../../application/commands/handlers/crud-create.handler';
import { CrudCreateCommand } from '../../../application/commands/impl/crud-create.command';
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
 * CRUD Create route decorator
 */
export const CrudCreate = <T extends PlainLiteralObject = PlainLiteralObject>(
  options: CrudRouteCommandOptionsInterface<T> = {},
) => {
  const {
    path,
    command,
    commandHandler,
    request,
    response,
    api,
    transactional,
  } = {
    ...options,
  };

  const bodyDto = request?.body;
  const validation: CrudValidationOptions<T> = bodyDto
    ? { ...request?.validation, expectedType: bodyDto }
    : request?.validation;

  return applyDecorators(
    Post(path),
    CrudOperation(Operation.Create),
    CrudCommand<T>({ command, commandTemplate: CrudCreateCommand }),
    CrudCommandHandler<T>({
      handler: commandHandler,
      handlerTemplate: CrudCreateHandler<T>,
    }),
    CrudValidate(validation),
    CrudSerialize(response?.serialization),
    CrudApiOperation(api?.operation),
    CrudApiBody({
      type: bodyDto,
      ...api?.body,
    }),
    CrudApiResponse(api?.response),
    ...getTransactionalDecorators(transactional),
  );
};
