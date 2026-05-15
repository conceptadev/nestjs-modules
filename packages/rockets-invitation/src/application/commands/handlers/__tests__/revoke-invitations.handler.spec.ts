import { createMockInvitationService } from '../../../../__tests__/helpers/mock.helpers';
import { RevokeInvitationsCommand } from '../../impl/revoke-invitations.command';
import { RevokeInvitationsHandler } from '../revoke-invitations.handler';

describe(RevokeInvitationsHandler.name, () => {
  const ctx = {};
  let mockService: ReturnType<typeof createMockInvitationService>;
  let handler: RevokeInvitationsHandler;

  beforeEach(() => {
    mockService = createMockInvitationService();
    handler = new RevokeInvitationsHandler(mockService);
  });

  it('should delegate to InvitationService.revokeByEmail', async () => {
    mockService.revokeByEmail.mockResolvedValue(undefined);

    await handler.execute(
      new RevokeInvitationsCommand(ctx, 'test@example.com', 'user'),
    );

    expect(mockService.revokeByEmail).toHaveBeenCalledWith(
      ctx,
      'test@example.com',
      'user',
    );
  });
});
