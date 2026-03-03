import { PlainLiteralObject } from '@nestjs/common';

import { ActionEnum, AppContextHost, Operation } from '@concepta/nestjs-common';

import { CrudContextInterface } from '../../../infrastructure/interceptors/interfaces/crud-context.interface';

import { mockCrudParsedQuery } from './crud-parsed-query.mock';

export function mockCrudContext<T extends PlainLiteralObject>(
  overrides: Partial<CrudContextInterface<T>> = {},
): CrudContextInterface<T> {
  return AppContextHost.merge<CrudContextInterface<T>>(() => ({
    entity: overrides.entity ?? 'TestEntity',
    params: overrides.params ?? {},
    query: overrides.query ?? mockCrudParsedQuery(),
    options: overrides.options ?? {},
    operation: overrides.operation ?? Operation.Read,
    action: overrides.action ?? ActionEnum.READ,
    locals: overrides.locals ?? {},
    hooks: overrides.hooks ?? [],
  }));
}
