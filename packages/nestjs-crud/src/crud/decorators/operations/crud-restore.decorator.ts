import {
  applyDecorators,
  HttpCode,
  HttpStatus,
  Patch,
  PlainLiteralObject,
} from '@nestjs/common';

import { Operation } from '@concepta/nestjs-common';

import { CRUD_MODULE_ROUTE_RESTORE_DEFAULT_PATH } from '../../../crud.constants';
import { getTransactionalDecorators } from '../../../util/get-transactional-decorators';
import { CrudRouteCommandOptionsInterface } from '../../interfaces/crud-route-ctlr-options.interface';
import { CrudRestoreCommand } from '../../operations/commands/crud-restore.command';
import { CrudRestoreHandler } from '../../operations/handlers/crud-restore.handler';
import { CrudApiOperation } from '../openapi/crud-api-operation.decorator';
import { CrudApiParam } from '../openapi/crud-api-param.decorator';
import { CrudApiResponse } from '../openapi/crud-api-response.decorator';
import { CrudCommandHandler } from '../routes/crud-command-handler.decorator';
import { CrudCommand } from '../routes/crud-command.decorator';
import { CrudOperation } from '../routes/crud-operation.decorator';
import { CrudReturnRestored } from '../routes/crud-return-restored.decorator';
import { CrudSerialize } from '../routes/crud-serialize.decorator';
import { CrudValidate } from '../routes/crud-validate.decorator';

/**
 * CRUD Restore route decorator
 */
export const CrudRestore = <T extends PlainLiteralObject = PlainLiteralObject>(
  options: CrudRouteCommandOptionsInterface<T> = {},
) => {
  const {
    path = CRUD_MODULE_ROUTE_RESTORE_DEFAULT_PATH,
    command,
    commandHandler,
    request,
    response,
    api,
    transactional,
  } = { ...options };

  const status =
    response?.returnRestored === true ? HttpStatus.OK : HttpStatus.NO_CONTENT;

  return applyDecorators(
    Patch(path),
    HttpCode(status),
    CrudOperation(Operation.Restore),
    CrudCommand<T>({ command, commandTemplate: CrudRestoreCommand }),
    CrudCommandHandler<T>({
      handler: commandHandler,
      handlerTemplate: CrudRestoreHandler<T>,
    }),
    CrudReturnRestored(response?.returnRestored),
    CrudValidate(request?.validation),
    CrudSerialize(response?.serialization),
    CrudApiOperation(api?.operation),
    CrudApiParam(api?.params),
    CrudApiResponse(api?.response),
    ...getTransactionalDecorators(transactional),
  );
};
