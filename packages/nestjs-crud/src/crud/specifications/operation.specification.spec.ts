import { ActionEnum, AppContextHost, Operation } from '@concepta/nestjs-common';

import { CrudContextInterface } from '../interfaces/crud-context.interface';

import { OperationSpecification } from './operation.specification';

function createContext(
  operation: Operation,
  action: ActionEnum,
): CrudContextInterface {
  return AppContextHost.merge<CrudContextInterface>(() => ({
    entity: '',
    operation,
    action,
    hooks: [],
    params: {},
    query: {} as CrudContextInterface['query'],
    options: {} as CrudContextInterface['options'],
    locals: {},
  }));
}

describe('OperationSpecification', () => {
  it('should match when operation is in the list', () => {
    const spec = new OperationSpecification([
      Operation.Create,
      Operation.Update,
    ]);

    expect(
      spec.isSatisfiedBy(createContext(Operation.Create, ActionEnum.CREATE)),
    ).toBe(true);
    expect(
      spec.isSatisfiedBy(createContext(Operation.Update, ActionEnum.UPDATE)),
    ).toBe(true);
  });

  it('should not match when operation is not in the list', () => {
    const spec = new OperationSpecification([Operation.Create]);

    expect(
      spec.isSatisfiedBy(createContext(Operation.Delete, ActionEnum.DELETE)),
    ).toBe(false);
  });
});
