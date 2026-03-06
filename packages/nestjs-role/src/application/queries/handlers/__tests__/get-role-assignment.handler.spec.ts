import {
  createMockRoleAssignmentRepository,
  createMockAssignmentRepositoryResolver,
  createMockContext,
  createMockRoleAssignmentEntity,
} from '../../../../__tests__/helpers/mock.helpers';
import { RoleAssignment } from '../../../../domain/aggregates/role-assignment';
import { RoleAssignmentNotFoundException } from '../../../exceptions/role-assignment-not-found.exception';
import { GetRoleAssignmentQuery } from '../../impl/get-role-assignment.query';
import { GetRoleAssignmentHandler } from '../get-role-assignment.handler';

describe(GetRoleAssignmentHandler.name, () => {
  const ctx = createMockContext();
  let mockRepo: ReturnType<typeof createMockRoleAssignmentRepository>;
  let handler: GetRoleAssignmentHandler;

  beforeEach(() => {
    mockRepo = createMockRoleAssignmentRepository();

    handler = new GetRoleAssignmentHandler(
      createMockAssignmentRepositoryResolver(mockRepo),
    );
  });

  it('should return a RoleAssignment when found', async () => {
    const existing = RoleAssignment.toInstance(
      createMockRoleAssignmentEntity(),
    );
    mockRepo.get.mockResolvedValue(existing);

    const result = await handler.execute(
      new GetRoleAssignmentQuery(ctx, 'test-assignment-id'),
    );

    expect(result).toBeInstanceOf(RoleAssignment);
    expect(result.toPlain()).toEqual({
      id: 'test-assignment-id',
      roleId: 'test-role-id',
      assigneeId: 'test-assignee-id',
      dateCreated: new Date('2026-01-01'),
      dateUpdated: new Date('2026-01-01'),
      dateDeleted: null,
      version: 1,
    });
  });

  it('should throw RoleAssignmentNotFoundException when not found', async () => {
    mockRepo.get.mockResolvedValue(null);

    await expect(
      handler.execute(new GetRoleAssignmentQuery(ctx, 'missing-id')),
    ).rejects.toThrow(RoleAssignmentNotFoundException);
  });
});
