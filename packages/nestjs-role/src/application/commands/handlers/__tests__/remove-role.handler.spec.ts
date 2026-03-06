import {
  createMockRoleRepository,
  createMockRoleRepositoryResolver,
  createMockTransaction,
  createMockContext,
  createMockRoleEntity,
} from '../../../../__tests__/helpers/mock.helpers';
import { Role } from '../../../../domain/aggregates/role';
import { RoleNotFoundException } from '../../../exceptions/role-not-found.exception';
import { RemoveRoleCommand } from '../../impl/remove-role.command';
import { RemoveRoleHandler } from '../remove-role.handler';

describe(RemoveRoleHandler.name, () => {
  const ctx = createMockContext();
  let mockRepo: ReturnType<typeof createMockRoleRepository>;
  let handler: RemoveRoleHandler;

  beforeEach(() => {
    mockRepo = createMockRoleRepository();
    const { transaction } = createMockTransaction();

    handler = new RemoveRoleHandler(
      createMockRoleRepositoryResolver(mockRepo),
      transaction as never,
    );
  });

  it('should remove the role', async () => {
    const existing = Role.toInstance(createMockRoleEntity());
    mockRepo.get.mockResolvedValue(existing);

    await handler.execute(new RemoveRoleCommand(ctx, 'test-role-id'));

    expect(mockRepo.remove).toHaveBeenCalledTimes(1);
    expect(mockRepo.remove).toHaveBeenCalledWith(ctx, existing);
  });

  it('should throw RoleNotFoundException when role does not exist', async () => {
    mockRepo.get.mockResolvedValue(null);

    await expect(
      handler.execute(new RemoveRoleCommand(ctx, 'missing-id')),
    ).rejects.toThrow(RoleNotFoundException);
  });
});
