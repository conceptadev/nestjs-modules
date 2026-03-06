import {
  createMockRoleAssignmentRepository,
  createMockAssignmentRepositoryResolver,
  createMockContext,
} from '../../../../__tests__/helpers/mock.helpers';
import { IsAssignedRoleQuery } from '../../impl/is-assigned-role.query';
import { IsAssignedRoleHandler } from '../is-assigned-role.handler';

describe(IsAssignedRoleHandler.name, () => {
  const ctx = createMockContext();
  let mockRepo: ReturnType<typeof createMockRoleAssignmentRepository>;
  let handler: IsAssignedRoleHandler;

  beforeEach(() => {
    mockRepo = createMockRoleAssignmentRepository();

    handler = new IsAssignedRoleHandler(
      createMockAssignmentRepositoryResolver(mockRepo),
    );
  });

  it('should return true when role is assigned', async () => {
    mockRepo.countByRoleIdAndAssignee.mockResolvedValue(1);

    const result = await handler.execute(
      new IsAssignedRoleQuery(ctx, 'role-1', 'user-1'),
    );

    expect(mockRepo.countByRoleIdAndAssignee).toHaveBeenCalledWith(
      ctx,
      'role-1',
      'user-1',
    );
    expect(result).toBe(true);
  });

  it('should return false when role is not assigned', async () => {
    mockRepo.countByRoleIdAndAssignee.mockResolvedValue(0);

    const result = await handler.execute(
      new IsAssignedRoleQuery(ctx, 'role-1', 'user-1'),
    );

    expect(result).toBe(false);
  });
});
