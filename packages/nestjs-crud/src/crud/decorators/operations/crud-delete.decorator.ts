import {
  applyDecorators,
  Delete,
  HttpCode,
  HttpStatus,
  PlainLiteralObject,
} from '@nestjs/common';

import { Operation } from '@concepta/nestjs-common';

import { CRUD_MODULE_ROUTE_ID_DEFAULT_PATH } from '../../../crud.constants';
import { getTransactionalDecorators } from '../../../util/get-transactional-decorators';
import { CrudRouteCommandOptionsInterface } from '../../interfaces/crud-route-ctlr-options.interface';
import { CrudDeleteCommand } from '../../operations/commands/crud-delete.command';
import { CrudDeleteHandler } from '../../operations/handlers/crud-delete.handler';
import { CrudApiOperation } from '../openapi/crud-api-operation.decorator';
import { CrudApiParam } from '../openapi/crud-api-param.decorator';
import { CrudApiResponse } from '../openapi/crud-api-response.decorator';
import { CrudCommandHandler } from '../routes/crud-command-handler.decorator';
import { CrudCommand } from '../routes/crud-command.decorator';
import { CrudOperation } from '../routes/crud-operation.decorator';
import { CrudReturnDeleted } from '../routes/crud-return-deleted.decorator';
import { CrudSerialize } from '../routes/crud-serialize.decorator';
import { CrudValidate } from '../routes/crud-validate.decorator';

/**
 * CRUD Delete route decorator (hard delete)
 */
export const CrudDelete = <T extends PlainLiteralObject = PlainLiteralObject>(
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

  const status =
    response?.returnDeleted === true ? HttpStatus.OK : HttpStatus.NO_CONTENT;

  return applyDecorators(
    Delete(path),
    HttpCode(status),
    CrudOperation(Operation.Delete),
    CrudCommand<T>({ command: command, commandTemplate: CrudDeleteCommand }),
    CrudCommandHandler<T>({
      handler: commandHandler,
      handlerTemplate: CrudDeleteHandler<T>,
    }),
    CrudReturnDeleted(response?.returnDeleted),
    CrudValidate(request?.validation),
    CrudSerialize(response?.serialization),
    CrudApiOperation(api?.operation),
    CrudApiParam(api?.params),
    CrudApiResponse(api?.response),
    ...getTransactionalDecorators(transactional),
  );
};
