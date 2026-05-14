import { PlainLiteralObject } from '@nestjs/common';

import { Operation } from '@concepta/rockets-app';

import {
  CrudRouteCommandOptionsInterface,
  CrudRouteQueryOptionsInterface,
} from '../interfaces/crud-route-ctlr-options.interface';

import { CrudExtraDecoratorsInterface } from './interfaces/crud-extra-decorators.interface';

/**
 * Operation options type - intersection of base props with union of query/command options.
 *
 * Each operation specifies an operation type and optionally a custom method name.
 * Multiple operations with the same operation are allowed when methodName differs.
 */
export type CrudOperationOptions<T extends PlainLiteralObject> = {
  operation: Operation;
  methodName?: string;
} & CrudExtraDecoratorsInterface &
  (CrudRouteQueryOptionsInterface<T> | CrudRouteCommandOptionsInterface<T>);
