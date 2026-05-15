import { applyDecorators, Get, PlainLiteralObject } from '@nestjs/common';

import { Operation } from '@concepta/rockets-app';

import { CrudReadHandler } from '../../../application/queries/handlers/crud-read.handler';
import { CrudReadQuery } from '../../../application/queries/impl/crud-read.query';
import { CRUD_MODULE_ROUTE_ID_DEFAULT_PATH } from '../../../crud.constants';
import { CrudRouteQueryOptionsInterface } from '../../interfaces/crud-route-ctlr-options.interface';
import { getTransactionalDecorators } from '../../utils/get-transactional-decorators';
import { CrudApiOperation } from '../openapi/crud-api-operation.decorator';
import { CrudApiParam } from '../openapi/crud-api-param.decorator';
import { CrudApiQuery } from '../openapi/crud-api-query.decorator';
import { CrudApiResponse } from '../openapi/crud-api-response.decorator';
import { CrudOperation } from '../routes/crud-operation.decorator';
import { CrudQueryHandler } from '../routes/crud-query-handler.decorator';
import { CrudQuery } from '../routes/crud-query.decorator';
import { CrudSerialize } from '../routes/crud-serialize.decorator';
import { CrudValidate } from '../routes/crud-validate.decorator';

/**
 * CRUD Read route decorator
 */
export const CrudRead = <T extends PlainLiteralObject = PlainLiteralObject>(
  options: CrudRouteQueryOptionsInterface<T> = {},
) => {
  const {
    path = CRUD_MODULE_ROUTE_ID_DEFAULT_PATH,
    query,
    queryHandler,
    request,
    response,
    api,
    transactional,
  } = { ...options };

  return applyDecorators(
    Get(path),
    CrudOperation(Operation.Read),
    CrudQuery<T>({ query, queryTemplate: CrudReadQuery<T> }),
    CrudQueryHandler<T>({
      handler: queryHandler,
      handlerTemplate: CrudReadHandler<T>,
    }),
    CrudValidate(request?.validation),
    CrudSerialize(response?.serialization),
    CrudApiOperation(api?.operation),
    CrudApiQuery(api?.query),
    CrudApiParam(api?.params),
    CrudApiResponse(api?.response),
    ...getTransactionalDecorators(transactional),
  );
};
