import { ActionEnum, Operation } from '@concepta/nestjs-common';

import { CrudContextInterface } from '../interfaces/crud-context.interface';

import { ActionSpecification } from './action.specification';

function createContext(
  operation: Operation,
  action: ActionEnum,
): CrudContextInterface {
  return {
    entity: '',
    operation,
    action,
    hooks: [],
    trx: null,
    params: {},
    query: {} as CrudContextInterface['query'],
    options: {} as CrudContextInterface['options'],
    locals: {},
  };
}

describe('ActionSpecification', () => {
  it('should match when action is in the list', () => {
    const spec = new ActionSpecification([
      ActionEnum.CREATE,
      ActionEnum.UPDATE,
    ]);

    expect(
      spec.isSatisfiedBy(createContext(Operation.Create, ActionEnum.CREATE)),
    ).toBe(true);
    expect(
      spec.isSatisfiedBy(createContext(Operation.Update, ActionEnum.UPDATE)),
    ).toBe(true);
  });

  it('should not match when action is not in the list', () => {
    const spec = new ActionSpecification([ActionEnum.CREATE]);

    expect(
      spec.isSatisfiedBy(createContext(Operation.Delete, ActionEnum.DELETE)),
    ).toBe(false);
  });
});
