import { createMockCommandBus } from '@concepta/nestjs-common/testing';

import {
  createMockTxScope,
  createMockUserEntity,
  createMockUserRepository,
  toUserDomain,
} from '../../../../__tests__/helpers/mock.helpers';
import { UserCredentials } from '../../../../domain/aggregates/user-credentials';
import { UserNotFoundException } from '../../../exceptions/user-not-found.exception';
import { CreateUserCredentialCommand } from '../../impl/create-user-credential.command';
import { SetUserPasswordCommand } from '../../impl/set-user-password.command';
import { SetUserPasswordHandler } from '../set-user-password.handler';

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
    userRepository.get.mockResolvedValue(toUserDomain(createMockUserEntity()));

    const result = await handler.execute(
      new SetUserPasswordCommand({}, 'user-1', 'secret'),
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
      handler.execute(new SetUserPasswordCommand({}, 'missing', 'secret')),
    ).rejects.toThrow(UserNotFoundException);
  });
});
