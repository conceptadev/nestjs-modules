import {
  RepositoryContextInterface,
  UserCreatableInterface,
} from '@concepta/nestjs-common';

import { createMockCommandBus } from '../../../../__tests__/fixtures/mock-command-bus.fixture';
import { createMockEventPublisher } from '../../../../__tests__/fixtures/mock-event-publisher.fixture';
import { createMockTxScope } from '../../../../__tests__/fixtures/mock-tx-scope.fixture';
import { createMockUserRepository } from '../../../../__tests__/fixtures/mock-user-repository.fixture';
import { User } from '../../../../domain/aggregates/user';
import { CreateUserCredentialCommand } from '../../impl/create-user-credential.command';
import { CreateUserCommand } from '../../impl/create-user.command';
import { CreateUserHandler } from '../create-user.handler';

const ctx = {} as RepositoryContextInterface;

describe(CreateUserHandler.name, () => {
  const userRepository = createMockUserRepository();
  const commandBus = createMockCommandBus();
  const eventPublisher = createMockEventPublisher();
  const txScope = createMockTxScope();

  let handler: CreateUserHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new CreateUserHandler(
      userRepository,
      commandBus,
      eventPublisher,
      txScope,
    );
  });

  it('should create and save a user', async () => {
    const dto: UserCreatableInterface = {
      email: 'a@b.com',
      username: 'john',
    };

    const result = await handler.execute(new CreateUserCommand(ctx, dto));

    expect(result).toBeInstanceOf(User);
    expect(result.email).toBe('a@b.com');
    expect(result.username).toBe('john');
    expect(userRepository.save).toHaveBeenCalledTimes(1);
  });

  it('should dispatch CreateUserCredentialCommand when password provided', async () => {
    const dto: UserCreatableInterface = {
      email: 'a@b.com',
      username: 'john',
      password: 'secret',
    };

    const result = await handler.execute(new CreateUserCommand(ctx, dto));

    expect(commandBus.execute).toHaveBeenCalledTimes(1);
    const dispatched = commandBus.execute.mock
      .calls[0][0] as CreateUserCredentialCommand;
    expect(dispatched.userId).toBe(result.id);
    expect(dispatched.password).toBe('secret');
  });

  it('should not dispatch credential command when no password', async () => {
    const dto: UserCreatableInterface = {
      email: 'a@b.com',
      username: 'john',
    };

    await handler.execute(new CreateUserCommand(ctx, dto));

    expect(commandBus.execute).not.toHaveBeenCalled();
  });
});
