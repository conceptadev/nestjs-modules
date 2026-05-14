import { applyDecorators, PlainLiteralObject, Put } from '@nestjs/common';

import { Operation } from '@concepta/rockets-app';

import { CrudReplaceHandler } from '../../../application/commands/handlers/crud-replace.handler';
import { CrudReplaceCommand } from '../../../application/commands/impl/crud-replace.command';
import { CRUD_MODULE_ROUTE_ID_DEFAULT_PATH } from '../../../crud.constants';
import { CrudValidationOptions } from '../../../crud.types';
import { CrudRouteCommandOptionsInterface } from '../../interfaces/crud-route-ctlr-options.interface';
import { getTransactionalDecorators } from '../../utils/get-transactional-decorators';
import { CrudApiBody } from '../openapi/crud-api-body.decorator';
import { CrudApiOperation } from '../openapi/crud-api-operation.decorator';
import { CrudApiParam } from '../openapi/crud-api-param.decorator';
import { CrudApiResponse } from '../openapi/crud-api-response.decorator';
import { CrudCommandHandler } from '../routes/crud-command-handler.decorator';
import { CrudCommand } from '../routes/crud-command.decorator';
import { CrudOperation } from '../routes/crud-operation.decorator';
import { CrudSerialize } from '../routes/crud-serialize.decorator';
import { CrudValidate } from '../routes/crud-validate.decorator';

/**
 * CRUD Replace route decorator
 */
export const CrudReplace = <T extends PlainLiteralObject = PlainLiteralObject>(
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
    Put(path),
    CrudOperation(Operation.Replace),
    CrudCommand<T>({ command, commandTemplate: CrudReplaceCommand }),
    CrudCommandHandler<T>({
      handler: commandHandler,
      handlerTemplate: CrudReplaceHandler<T>,
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
