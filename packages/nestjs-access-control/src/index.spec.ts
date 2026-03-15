import {
  PossessionEnum,
  AccessControlCreateMany,
  AccessControlCreateOne,
  AccessControlDeleteOne,
  AccessControlQuery,
  AccessControlGrant,
  AccessControlGuard,
  AccessControlModule,
  AccessControlContext,
  AccessControlReadMany,
  AccessControlReadOne,
  AccessControlRecoverOne,
  AccessControlReplaceOne,
  AccessControlUpdateOne,
  AccessControlService,
} from './index';

describe('Index', () => {
  // modules
  it('All exported modules should be imported', () => {
    expect(AccessControlGuard).toEqual(expect.any(Function));
    expect(AccessControlModule).toEqual(expect.any(Function));
    expect(AccessControlContext).toEqual(expect.any(Function));
  });

  it('All exported services should be imported', () => {
    expect(AccessControlService).toEqual(expect.any(Function));
  });

  // decorators
  it('All exported decorators should be imported', () => {
    expect(AccessControlCreateMany).toEqual(expect.any(Function));
    expect(AccessControlCreateOne).toEqual(expect.any(Function));
    expect(AccessControlDeleteOne).toEqual(expect.any(Function));
    expect(AccessControlQuery).toEqual(expect.any(Function));
    expect(AccessControlGrant).toEqual(expect.any(Function));
    expect(AccessControlReadMany).toEqual(expect.any(Function));
    expect(AccessControlReadOne).toEqual(expect.any(Function));
    expect(AccessControlUpdateOne).toEqual(expect.any(Function));
    expect(AccessControlRecoverOne).toEqual(expect.any(Function));
    expect(AccessControlReplaceOne).toEqual(expect.any(Function));
  });

  // enums
  it('All exported enums should be imported', () => {
    expect(PossessionEnum).toEqual(expect.any(Object));
  });
});
