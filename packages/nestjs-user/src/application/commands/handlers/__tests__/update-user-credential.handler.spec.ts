import { RepositoryContextInterface } from '@concepta/nestjs-common';

import { createMockTxScope } from '../../../../__tests__/fixtures/mock-tx-scope.fixture';
import { createMockUserCredentialsService } from '../../../../__tests__/fixtures/mock-user-credentials-service.fixture';
import { UpdateUserCredentialCommand } from '../../impl/update-user-credential.command';
import { UpdateUserCredentialHandler } from '../update-user-credential.handler';

const ctx = {} as RepositoryContextInterface;

describe(UpdateUserCredentialHandler.name, () => {
  const userCredentialsService = createMockUserCredentialsService();
  const txScope = createMockTxScope();

  let handler: UpdateUserCredentialHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new UpdateUserCredentialHandler(userCredentialsService, txScope);
  });

  it('should delegate to userCredentialsService.updatePassword', async () => {
    const passwordDto = { password: 'new-pass', passwordCurrent: 'old-pass' };

    await handler.execute(
      new UpdateUserCredentialCommand(ctx, 'user-1', passwordDto),
    );

    expect(userCredentialsService.updatePassword).toHaveBeenCalledWith(
      ctx,
      expect.anything(),
      'user-1',
      'new-pass',
      'old-pass',
    );
  });

  it('should work without passwordCurrent', async () => {
    const passwordDto = { password: 'new-pass' };

    await handler.execute(
      new UpdateUserCredentialCommand(ctx, 'user-1', passwordDto),
    );

    expect(userCredentialsService.updatePassword).toHaveBeenCalledWith(
      ctx,
      expect.anything(),
      'user-1',
      'new-pass',
      undefined,
    );
  });
});
