import {
  createMockRoleAssignmentRepository,
  createMockAssignmentRepositoryResolver,
  createMockTransaction,
  createMockEventPublisher,
  createMockRoleAssignmentEntity,
  toRoleAssignmentDomain,
  DEFAULT_ROLE_NAMESPACE,
} from '../../../../__tests__/helpers/mock.helpers';
import { RevokeRoleCommand } from '../../impl/revoke-role.command';
import { RevokeRoleHandler } from '../revoke-role.handler';

describe(RevokeRoleHandler.name, () => {
  const ctx = {};
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
    const existing = toRoleAssignmentDomain(
      createMockRoleAssignmentEntity({
        roleId: 'role-1',
        assigneeId: 'user-1',
      }),
    );
    mockRepo.findOne.mockResolvedValue(existing);

    await handler.execute(
      new RevokeRoleCommand(ctx, DEFAULT_ROLE_NAMESPACE, 'role-1', 'user-1'),
    );

    expect(mockRepo.findOne).toHaveBeenCalledWith(ctx, 'role-1', 'user-1');
    expect(mockRepo.remove).toHaveBeenCalledTimes(1);
    expect(mockRepo.remove).toHaveBeenCalledWith(ctx, existing);
  });

  it('should register onCommit and onRollback', async () => {
    const existing = toRoleAssignmentDomain(createMockRoleAssignmentEntity());
    mockRepo.findOne.mockResolvedValue(existing);

    await handler.execute(
      new RevokeRoleCommand(
        ctx,
        DEFAULT_ROLE_NAMESPACE,
        'test-role-id',
        'test-assignee-id',
      ),
    );

    expect(trxHandle.onCommit).toHaveBeenCalledTimes(1);
    expect(trxHandle.onRollback).toHaveBeenCalledTimes(1);
  });

  it('should do nothing when assignment not found', async () => {
    mockRepo.findOne.mockResolvedValue(null);

    await handler.execute(
      new RevokeRoleCommand(ctx, DEFAULT_ROLE_NAMESPACE, 'role-1', 'user-1'),
    );

    expect(mockRepo.remove).not.toHaveBeenCalled();
  });
});
