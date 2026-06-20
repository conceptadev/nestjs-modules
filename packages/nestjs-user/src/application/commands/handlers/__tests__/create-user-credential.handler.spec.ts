import { AppContextHost } from '@concepta/nestjs-core';

import {
  createMockTxScope,
  createMockUserCredentialsService,
} from '../../../../__tests__/helpers/mock.helpers';
import { UserCredentials } from '../../../../domain/aggregates/user-credentials';
import { CreateUserCredentialCommand } from '../../impl/create-user-credential.command';
import { CreateUserCredentialHandler } from '../create-user-credential.handler';

describe(CreateUserCredentialHandler.name, () => {
  const userCredentialsService = createMockUserCredentialsService();
  const txScope = createMockTxScope();
  const mockCredentials = {} as UserCredentials;

  let handler: CreateUserCredentialHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    userCredentialsService.setPassword.mockResolvedValue(mockCredentials);
    handler = new CreateUserCredentialHandler(userCredentialsService, txScope);
  });

  it('should delegate to userCredentialsService.setPassword', async () => {
    const result = await handler.execute(
      new CreateUserCredentialCommand({}, 'user-1', 'secret'),
    );

    expect(result).toBe(mockCredentials);
    expect(userCredentialsService.setPassword).toHaveBeenCalledTimes(1);
    const [ctx, , userId, password] =
      userCredentialsService.setPassword.mock.calls[0];
    expect(ctx).toBeInstanceOf(AppContextHost);
    expect(userId).toBe('user-1');
    expect(password).toBe('secret');
  });
});
