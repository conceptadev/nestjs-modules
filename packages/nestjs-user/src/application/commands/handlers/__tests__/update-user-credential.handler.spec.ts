import {
  createMockTxScope,
  createMockUserCredentialsService,
} from '../../../../__tests__/helpers/mock.helpers';
import { UpdateUserCredentialCommand } from '../../impl/update-user-credential.command';
import { UpdateUserCredentialHandler } from '../update-user-credential.handler';

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
      new UpdateUserCredentialCommand({}, 'user-1', passwordDto),
    );

    expect(userCredentialsService.updatePassword).toHaveBeenCalledWith(
      {},
      expect.anything(),
      'user-1',
      'new-pass',
      'old-pass',
    );
  });

  it('should work without passwordCurrent', async () => {
    const passwordDto = { password: 'new-pass' };

    await handler.execute(
      new UpdateUserCredentialCommand({}, 'user-1', passwordDto),
    );

    expect(userCredentialsService.updatePassword).toHaveBeenCalledWith(
      {},
      expect.anything(),
      'user-1',
      'new-pass',
      undefined,
    );
  });
});
