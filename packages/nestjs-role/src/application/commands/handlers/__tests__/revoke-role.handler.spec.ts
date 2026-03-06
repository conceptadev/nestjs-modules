import {
  createMockRoleAssignmentRepository,
  createMockAssignmentRepositoryResolver,
  createMockTransaction,
  createMockEventPublisher,
  createMockContext,
  createMockRoleAssignmentEntity,
} from '../../../../__tests__/helpers/mock.helpers';
import { RoleAssignment } from '../../../../domain/aggregates/role-assignment';
import { RevokeRoleCommand } from '../../impl/revoke-role.command';
import { RevokeRoleHandler } from '../revoke-role.handler';

describe(RevokeRoleHandler.name, () => {
  const ctx = createMockContext();
  let mockRepo: ReturnType<typeof createMockRoleAssignmentRepository>;
  let handler: RevokeRoleHandler;
  let trxHandle: ReturnType<typeof createMockTransaction>['trxHandle'];

  beforeEach(() => {
    mockRepo = createMockRoleAssignmentRepository();
    const { transaction, trxHandle: trx } = createMockTransaction();
    trxHandle = trx;

    handler = new RevokeRoleHandler(
      createMockAssignmentRepositoryResolver(mockRepo),
      transaction as never,
      createMockEventPublisher() as never,
    );
  });

  it('should revoke and remove the assignment', async () => {
    const existing = RoleAssignment.toInstance(
      createMockRoleAssignmentEntity({
        roleId: 'role-1',
        assigneeId: 'user-1',
      }),
    );
    mockRepo.findOne.mockResolvedValue(existing);

    await handler.execute(new RevokeRoleCommand(ctx, 'role-1', 'user-1'));

    expect(mockRepo.findOne).toHaveBeenCalledWith(ctx, 'role-1', 'user-1');
    expect(mockRepo.remove).toHaveBeenCalledTimes(1);
    expect(mockRepo.remove).toHaveBeenCalledWith(ctx, existing);
  });

  it('should register onCommit and onRollback', async () => {
    const existing = RoleAssignment.toInstance(
      createMockRoleAssignmentEntity(),
    );
    mockRepo.findOne.mockResolvedValue(existing);

    await handler.execute(
      new RevokeRoleCommand(ctx, 'test-role-id', 'test-assignee-id'),
    );

    expect(trxHandle.onCommit).toHaveBeenCalledTimes(1);
    expect(trxHandle.onRollback).toHaveBeenCalledTimes(1);
  });

  it('should do nothing when assignment not found', async () => {
    mockRepo.findOne.mockResolvedValue(null);

    await handler.execute(new RevokeRoleCommand(ctx, 'role-1', 'user-1'));

    expect(mockRepo.remove).not.toHaveBeenCalled();
  });
});
