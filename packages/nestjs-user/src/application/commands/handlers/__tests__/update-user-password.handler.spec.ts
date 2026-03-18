import { RepositoryContextInterface } from '@concepta/nestjs-common';
import { createMockCommandBus } from '@concepta/nestjs-common/testing';

import {
  createMockTxScope,
  createMockUserRepository,
} from '../../../../__tests__/helpers/mock.helpers';
import { UserMapper } from '../../../../infrastructure/persistence/user.mapper';
import { UserNotFoundException } from '../../../exceptions/user-not-found.exception';
import { UpdateUserCredentialCommand } from '../../impl/update-user-credential.command';
import { UpdateUserPasswordCommand } from '../../impl/update-user-password.command';
import { UpdateUserPasswordHandler } from '../update-user-password.handler';

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

describe(UpdateUserPasswordHandler.name, () => {
  const userRepository = createMockUserRepository();
  const commandBus = createMockCommandBus();
  const txScope = createMockTxScope();

  let handler: UpdateUserPasswordHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new UpdateUserPasswordHandler(
      userRepository,
      commandBus,
      txScope,
    );
  });

  it('should dispatch UpdateUserCredentialCommand when user found', async () => {
    userRepository.get.mockResolvedValue(userMapper.toDomain(mockUserEntity));

    const passwordDto = { password: 'new-pass', passwordCurrent: 'old-pass' };

    await handler.execute(
      new UpdateUserPasswordCommand(ctx, 'user-1', passwordDto),
    );

    expect(commandBus.execute).toHaveBeenCalledTimes(1);
    const dispatched = commandBus.execute.mock
      .calls[0][0] as UpdateUserCredentialCommand;
    expect(dispatched.userId).toBe('user-1');
    expect(dispatched.passwordDto).toBe(passwordDto);
  });

  it('should throw UserNotFoundException when not found', async () => {
    userRepository.get.mockResolvedValue(null);

    await expect(
      handler.execute(
        new UpdateUserPasswordCommand(ctx, 'missing', {
          password: 'new',
        }),
      ),
    ).rejects.toThrow(UserNotFoundException);
  });
});
