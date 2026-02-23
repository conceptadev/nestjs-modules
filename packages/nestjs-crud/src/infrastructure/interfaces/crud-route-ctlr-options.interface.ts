import { PlainLiteralObject, Type } from '@nestjs/common';
import {
  ApiBodyOptions,
  ApiOperationOptions,
  ApiParamOptions,
  ApiQueryOptions,
  ApiResponseOptions,
} from '@nestjs/swagger';

import { CrudCommandHandlerInterface } from '../../application/commands/interfaces/crud-command-handler.interface';
import { CrudCommandInterface } from '../../application/commands/interfaces/crud-command.interface';
import { CrudQueryHandlerInterface } from '../../application/queries/interfaces/crud-query-handler.interface';
import { CrudQueryInterface } from '../../application/queries/interfaces/crud-query.interface';
import { CrudRequestConfig } from '../request/interfaces/crud-request-config.interface';
import { CrudResponseConfig } from '../request/interfaces/crud-response-config.interface';

import { CrudTransactionalInterface } from './crud-transactional.interface';

interface CrudRouteCtlrOptionsInterface<T extends PlainLiteralObject> {
  path?: string | string[];
  /**
   * Request configuration overrides for this route.
   */
  request?: CrudRequestConfig<T>;

  /**
   * Response configuration overrides for this route.
   */
  response?: CrudResponseConfig;

  api?: {
    operation?: ApiOperationOptions;
    query?: ApiQueryOptions[];
    params?: ApiParamOptions;
    body?: ApiBodyOptions;
    response?: ApiResponseOptions;
  };
}

export interface CrudRouteQueryOptionsInterface<
  T extends PlainLiteralObject = PlainLiteralObject,
> extends CrudRouteCtlrOptionsInterface<T>,
    CrudTransactionalInterface {
  query?: Type<CrudQueryInterface<T>>;
  queryHandler?: Type<CrudQueryHandlerInterface<T>>;
}

export interface CrudRouteCommandOptionsInterface<
  T extends PlainLiteralObject = PlainLiteralObject,
> extends CrudRouteCtlrOptionsInterface<T>,
    CrudTransactionalInterface {
  command?: Type<CrudCommandInterface<T>>;
  commandHandler?: Type<CrudCommandHandlerInterface<T>>;
}
