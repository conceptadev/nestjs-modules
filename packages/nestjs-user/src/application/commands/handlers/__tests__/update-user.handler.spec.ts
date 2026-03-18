import { RepositoryContextInterface } from '@concepta/nestjs-common';

import {
  createMockEventPublisher,
  createMockTxScope,
  createMockUserEntity,
  createMockUserRepository,
  toUserDomain,
} from '../../../../__tests__/helpers/mock.helpers';
import { User } from '../../../../domain/aggregates/user';
import { UserNotFoundException } from '../../../exceptions/user-not-found.exception';
import { UpdateUserCommand } from '../../impl/update-user.command';
import { UpdateUserHandler } from '../update-user.handler';

const ctx = {} as RepositoryContextInterface;

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
    userRepository.get.mockResolvedValue(toUserDomain(createMockUserEntity()));

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
