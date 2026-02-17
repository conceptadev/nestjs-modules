import { PlainLiteralObject, Type } from '@nestjs/common';
import {
  ApiBodyOptions,
  ApiOperationOptions,
  ApiParamOptions,
  ApiQueryOptions,
  ApiResponseOptions,
} from '@nestjs/swagger';

import { CrudCommandHandlerInterface } from './crud-command-handler.interface';
import { CrudCommandInterface } from './crud-command.interface';
import { CrudQueryHandlerInterface } from './crud-query-handler.interface';
import { CrudQueryInterface } from './crud-query.interface';
import { CrudRequestConfig } from './crud-request-config.interface';
import { CrudResponseConfig } from './crud-response-config.interface';

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
> extends CrudRouteCtlrOptionsInterface<T> {
  query?: Type<CrudQueryInterface<T>>;
  queryHandler?: Type<CrudQueryHandlerInterface<T>>;
}

export interface CrudRouteCommandOptionsInterface<
  T extends PlainLiteralObject = PlainLiteralObject,
> extends CrudRouteCtlrOptionsInterface<T> {
  command?: Type<CrudCommandInterface<T>>;
  commandHandler?: Type<CrudCommandHandlerInterface<T>>;
}
