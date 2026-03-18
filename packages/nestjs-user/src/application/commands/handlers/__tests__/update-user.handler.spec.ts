import { RepositoryContextInterface } from '@concepta/nestjs-common';

import { createMockEventPublisher } from '../../../../__tests__/fixtures/mock-event-publisher.fixture';
import { createMockTxScope } from '../../../../__tests__/fixtures/mock-tx-scope.fixture';
import { createMockUserRepository } from '../../../../__tests__/fixtures/mock-user-repository.fixture';
import { User } from '../../../../domain/aggregates/user';
import { UserMapper } from '../../../../infrastructure/persistence/user.mapper';
import { UserNotFoundException } from '../../../exceptions/user-not-found.exception';
import { UpdateUserCommand } from '../../impl/update-user.command';
import { UpdateUserHandler } from '../update-user.handler';

const ctx = {} as RepositoryContextInterface;
const userMapper = new UserMapper();
const mockUserEntity = {
  id: 'user-1',
  email: 'a@b.com',
  username: 'john',
  active: true,
  dateCreated: new Date('2024-01-01'),
  dateUpdated: new Date('2024-01-01'),
  dateDeleted: null,
  version: 1,
};

describe(UpdateUserHandler.name, () => {
  const userRepository = createMockUserRepository();
  const eventPublisher = createMockEventPublisher();
  const txScope = createMockTxScope();

  let handler: UpdateUserHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new UpdateUserHandler(userRepository, eventPublisher, txScope);
  });

  it('should update and return user when found', async () => {
    userRepository.get.mockResolvedValue(userMapper.toDomain(mockUserEntity));

    const result = await handler.execute(
      new UpdateUserCommand(ctx, 'user-1', { active: false }),
    );

    expect(result).toBeInstanceOf(User);
    expect(result.active).toBe(false);
    expect(result.version).toBe(2);
    expect(userRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should throw UserNotFoundException when not found', async () => {
    userRepository.get.mockResolvedValue(null);

    await expect(
      handler.execute(new UpdateUserCommand(ctx, 'missing', { active: false })),
    ).rejects.toThrow(UserNotFoundException);
  });
});
