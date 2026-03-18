import { RepositoryContextInterface } from '@concepta/nestjs-common';

import { createMockCommandBus } from '../../../../__tests__/fixtures/mock-command-bus.fixture';
import { createMockTxScope } from '../../../../__tests__/fixtures/mock-tx-scope.fixture';
import { createMockUserRepository } from '../../../../__tests__/fixtures/mock-user-repository.fixture';
import { UserCredentials } from '../../../../domain/aggregates/user-credentials';
import { UserMapper } from '../../../../infrastructure/persistence/user.mapper';
import { UserNotFoundException } from '../../../exceptions/user-not-found.exception';
import { CreateUserCredentialCommand } from '../../impl/create-user-credential.command';
import { SetUserPasswordCommand } from '../../impl/set-user-password.command';
import { SetUserPasswordHandler } from '../set-user-password.handler';

const ctx = {} as RepositoryContextInterface;
const userMapper = new UserMapper();
const mockUserEntity = {
  id: 'user-1',
  email: 'a@b.com',
  username: 'john',
  active: true,
  dateCreated: new Date(),
  dateUpdated: new Date(),
  dateDeleted: null,
  version: 1,
};

describe(SetUserPasswordHandler.name, () => {
  const userRepository = createMockUserRepository();
  const commandBus = createMockCommandBus();
  const txScope = createMockTxScope();
  const mockCredentials = {} as UserCredentials;

  let handler: SetUserPasswordHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    commandBus.execute.mockResolvedValue(mockCredentials);
    handler = new SetUserPasswordHandler(userRepository, commandBus, txScope);
  });

  it('should dispatch CreateUserCredentialCommand when user found', async () => {
    userRepository.get.mockResolvedValue(userMapper.toDomain(mockUserEntity));

    const result = await handler.execute(
      new SetUserPasswordCommand(ctx, 'user-1', 'secret'),
    );

    expect(result).toBe(mockCredentials);
    expect(commandBus.execute).toHaveBeenCalledTimes(1);
    const dispatched = commandBus.execute.mock
      .calls[0][0] as CreateUserCredentialCommand;
    expect(dispatched.userId).toBe('user-1');
    expect(dispatched.password).toBe('secret');
  });

  it('should throw UserNotFoundException when not found', async () => {
    userRepository.get.mockResolvedValue(null);

    await expect(
      handler.execute(new SetUserPasswordCommand(ctx, 'missing', 'secret')),
    ).rejects.toThrow(UserNotFoundException);
  });
});
