import { AppContextHost } from '@concepta/nestjs-core';

import {
  createMockRoleAssignmentRepository,
  createMockAssignmentRepositoryResolver,
  createMockTransaction,
  createMockEventPublisher,
  createMockRoleAssignmentEntity,
  toRoleAssignmentDomain,
  DEFAULT_ROLE_NAMESPACE,
} from '../../../../__tests__/helpers/mock.helpers.js';
import { RevokeRolesCommand } from '../../impl/revoke-roles.command.js';
import { RevokeRolesHandler } from '../revoke-roles.handler.js';

describe(RevokeRolesHandler.name, () => {
  const ctx = {};
  let mockRepo: ReturnType<typeof createMockRoleAssignmentRepository>;
  let handler: RevokeRolesHandler;
  let trxHandle: ReturnType<typeof createMockTransaction>['trxHandle'];

  beforeEach(() => {
    mockRepo = createMockRoleAssignmentRepository();
    const { transaction, trxHandle: trx } = createMockTransaction();
    trxHandle = trx;

    handler = new RevokeRolesHandler(
      createMockAssignmentRepositoryResolver(mockRepo),
      transaction as never,
      createMockEventPublisher() as never,
    );
  });

  it('should revoke and remove all matching assignments', async () => {
    const assignment1 = toRoleAssignmentDomain(
      createMockRoleAssignmentEntity({
        id: 'a1',
        roleId: 'role-1',
        assigneeId: 'user-1',
      }),
    );
    const assignment2 = toRoleAssignmentDomain(
      createMockRoleAssignmentEntity({
        id: 'a2',
        roleId: 'role-2',
        assigneeId: 'user-1',
      }),
    );
    mockRepo.findByRoleIdsAndAssignee.mockResolvedValue([
      assignment1,
      assignment2,
    ]);

    await handler.execute(
      new RevokeRolesCommand(
        ctx,
        DEFAULT_ROLE_NAMESPACE,
        ['role-1', 'role-2'],
        'user-1',
      ),
    );

    expect(mockRepo.findByRoleIdsAndAssignee).toHaveBeenCalledTimes(1);
    const [findCtx, findRoleIds, findAssigneeId] =
      mockRepo.findByRoleIdsAndAssignee.mock.calls[0];
    expect(findCtx).toBeInstanceOf(AppContextHost);
    expect(findRoleIds).toEqual(['role-1', 'role-2']);
    expect(findAssigneeId).toBe('user-1');

    expect(mockRepo.removeMany).toHaveBeenCalledTimes(1);
    const [removeCtx, removeEntities] = mockRepo.removeMany.mock.calls[0];
    expect(removeCtx).toBeInstanceOf(AppContextHost);
    expect(removeEntities).toEqual([assignment1, assignment2]);
  });

  it('should register onCommit and onRollback', async () => {
    const assignment = toRoleAssignmentDomain(createMockRoleAssignmentEntity());
    mockRepo.findByRoleIdsAndAssignee.mockResolvedValue([assignment]);

    await handler.execute(
      new RevokeRolesCommand(
        ctx,
        DEFAULT_ROLE_NAMESPACE,
        ['test-role-id'],
        'test-assignee-id',
      ),
    );

    expect(trxHandle.onCommit).toHaveBeenCalledTimes(1);
    expect(trxHandle.onRollback).toHaveBeenCalledTimes(1);
  });

  it('should only remove found assignments', async () => {
    const assignment = toRoleAssignmentDomain(
      createMockRoleAssignmentEntity({ roleId: 'role-1' }),
    );
    mockRepo.findByRoleIdsAndAssignee.mockResolvedValue([assignment]);

    await handler.execute(
      new RevokeRolesCommand(
        ctx,
        DEFAULT_ROLE_NAMESPACE,
        ['role-1', 'role-2'],
        'user-1',
      ),
    );

    expect(mockRepo.removeMany).toHaveBeenCalledTimes(1);
    const [removeCtx2, removeEntities2] = mockRepo.removeMany.mock.calls[0];
    expect(removeCtx2).toBeInstanceOf(AppContextHost);
    expect(removeEntities2).toEqual([assignment]);
  });
});
