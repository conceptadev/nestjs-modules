import {
  createMockRoleRepository,
  createMockRoleRepositoryResolver,
  createMockTransaction,
  createMockEventPublisher,
  createMockContext,
} from '../../../../__tests__/helpers/mock.helpers';
import { Role } from '../../../../domain/aggregates/role';
import { CreateRoleCommand } from '../../impl/create-role.command';
import { CreateRoleHandler } from '../create-role.handler';

describe(CreateRoleHandler.name, () => {
  const ctx = createMockContext();
  let mockRepo: ReturnType<typeof createMockRoleRepository>;
  let handler: CreateRoleHandler;
  let trxHandle: ReturnType<typeof createMockTransaction>['trxHandle'];

  beforeEach(() => {
    mockRepo = createMockRoleRepository();
    const { transaction, trxHandle: trx } = createMockTransaction();
    trxHandle = trx;

    handler = new CreateRoleHandler(
      createMockRoleRepositoryResolver(mockRepo),
      transaction as never,
      createMockEventPublisher() as never,
    );
  });

  it('should return a Role instance with correct properties', async () => {
    const dto = { name: 'Admin', description: 'Administrator role' };

    const result = await handler.execute(new CreateRoleCommand(ctx, dto));

    expect(result).toBeInstanceOf(Role);
    expect(result.name).toBe('Admin');
    expect(result.description).toBe('Administrator role');
  });

  it('should save and return the created role', async () => {
    const dto = { name: 'Admin', description: 'Admin' };

    const result = await handler.execute(new CreateRoleCommand(ctx, dto));

    expect(mockRepo.save).toHaveBeenCalledTimes(1);
    expect(result.toPlain()).toEqual({
      id: expect.any(String),
      name: 'Admin',
      description: 'Admin',
      dateCreated: expect.any(Date),
      dateUpdated: expect.any(Date),
      dateDeleted: null,
      version: 1,
    });
  });

  it('should register onCommit and onRollback', async () => {
    const dto = { name: 'Admin', description: 'Admin' };

    await handler.execute(new CreateRoleCommand(ctx, dto));

    expect(trxHandle.onCommit).toHaveBeenCalledTimes(1);
    expect(trxHandle.onRollback).toHaveBeenCalledTimes(1);
  });
});
