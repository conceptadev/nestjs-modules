import {
  createMockRoleRepository,
  createMockRoleRepositoryResolver,
  createMockContext,
  createMockRoleEntity,
} from '../../../../__tests__/helpers/mock.helpers';
import { Role } from '../../../../domain/aggregates/role';
import { RoleNotFoundException } from '../../../exceptions/role-not-found.exception';
import { GetRoleQuery } from '../../impl/get-role.query';
import { GetRoleHandler } from '../get-role.handler';

describe(GetRoleHandler.name, () => {
  const ctx = createMockContext();
  let mockRepo: ReturnType<typeof createMockRoleRepository>;
  let handler: GetRoleHandler;

  beforeEach(() => {
    mockRepo = createMockRoleRepository();

    handler = new GetRoleHandler(createMockRoleRepositoryResolver(mockRepo));
  });

  it('should return a Role when found', async () => {
    const existing = Role.toInstance(createMockRoleEntity());
    mockRepo.get.mockResolvedValue(existing);

    const result = await handler.execute(new GetRoleQuery(ctx, 'test-role-id'));

    expect(result).toBeInstanceOf(Role);
    expect(result.toPlain()).toEqual({
      id: 'test-role-id',
      name: 'Test Role',
      description: 'A test role',
      dateCreated: new Date('2026-01-01'),
      dateUpdated: new Date('2026-01-01'),
      dateDeleted: null,
      version: 1,
    });
  });

  it('should throw RoleNotFoundException when not found', async () => {
    mockRepo.get.mockResolvedValue(null);

    await expect(
      handler.execute(new GetRoleQuery(ctx, 'missing-id')),
    ).rejects.toThrow(RoleNotFoundException);
  });
});
