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
import { RemoveUserCommand } from '../../impl/remove-user.command';
import { RemoveUserHandler } from '../remove-user.handler';

const ctx = {} as RepositoryContextInterface;

describe(RemoveUserHandler.name, () => {
  const userRepository = createMockUserRepository();
  const eventPublisher = createMockEventPublisher();
  const txScope = createMockTxScope();

  let handler: RemoveUserHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new RemoveUserHandler(userRepository, txScope, eventPublisher);
  });

  it('should remove and return user when found', async () => {
    userRepository.get.mockResolvedValue(toUserDomain(createMockUserEntity()));

    const result = await handler.execute(new RemoveUserCommand(ctx, 'user-1'));

    expect(result).toBeInstanceOf(User);
    expect(result.id).toBe('user-1');
    expect(userRepository.remove).toHaveBeenCalledTimes(1);
  });

  it('should throw UserNotFoundException when not found', async () => {
    userRepository.get.mockResolvedValue(null);

    await expect(
      handler.execute(new RemoveUserCommand(ctx, 'missing')),
    ).rejects.toThrow(UserNotFoundException);
  });
});
