import { PlainLiteralObject, Type } from '@nestjs/common';

import { CrudOptionsInterface } from './infrastructure/request/interfaces/crud-options.interface';
import { ConfigurableCrudOptions } from './infrastructure/utils/interfaces/configurable-crud-options.interface';

export type CrudValidationOptions<Entity extends PlainLiteralObject> =
  CrudOptionsInterface<Entity>['validation'];

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type DecoratorTargetObject<T = any> = Type<T> | T;

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type ControllerTarget = Function;

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type MethodHandler = Function;

export type ConfigurableCrudOptionsTransformer<
  Entity extends PlainLiteralObject,
  T extends PlainLiteralObject,
> = (
  options: ConfigurableCrudOptions<Entity>,
  extras?: T,
) => ConfigurableCrudOptions<Entity>;
