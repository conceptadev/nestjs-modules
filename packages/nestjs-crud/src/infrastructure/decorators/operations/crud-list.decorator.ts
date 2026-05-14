import { applyDecorators, Get, PlainLiteralObject } from '@nestjs/common';

import { Operation } from '@concepta/rockets-app';

import { CrudListHandler } from '../../../application/queries/handlers/crud-list.handler';
import { CrudListQuery } from '../../../application/queries/impl/crud-list.query';
import { CrudRouteQueryOptionsInterface } from '../../interfaces/crud-route-ctlr-options.interface';
import { getTransactionalDecorators } from '../../utils/get-transactional-decorators';
import { CrudApiOperation } from '../openapi/crud-api-operation.decorator';
import { CrudApiQuery } from '../openapi/crud-api-query.decorator';
import { CrudApiResponse } from '../openapi/crud-api-response.decorator';
import { CrudOperation } from '../routes/crud-operation.decorator';
import { CrudQueryHandler } from '../routes/crud-query-handler.decorator';
import { CrudQuery } from '../routes/crud-query.decorator';
import { CrudSerialize } from '../routes/crud-serialize.decorator';
import { CrudValidate } from '../routes/crud-validate.decorator';

/**
 * CRUD List route decorator
 */
export const CrudList = <T extends PlainLiteralObject = PlainLiteralObject>(
  options: CrudRouteQueryOptionsInterface<T> = {},
) => {
  const { path, query, queryHandler, request, response, api, transactional } = {
    ...options,
  };

  return applyDecorators(
    Get(path),
    CrudOperation(Operation.List),
    CrudQuery<T>({ query, queryTemplate: CrudListQuery<T> }),
    CrudQueryHandler<T>({
      handler: queryHandler,
      handlerTemplate: CrudListHandler,
    }),
    CrudValidate(request?.validation),
    CrudSerialize(response?.serialization),
    CrudApiOperation(api?.operation),
    CrudApiQuery(api?.query),
    CrudApiResponse(api?.response),
    ...getTransactionalDecorators(transactional),
  );
};
