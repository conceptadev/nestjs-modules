import { createMockInvitationService } from '../../../../__tests__/helpers/mock.helpers';
import { SendInvitationCommand } from '../../impl/send-invitation.command';
import { SendInvitationHandler } from '../send-invitation.handler';

describe(SendInvitationHandler.name, () => {
  const ctx = {};
  let mockService: ReturnType<typeof createMockInvitationService>;
  let handler: SendInvitationHandler;

  beforeEach(() => {
    mockService = createMockInvitationService();
    handler = new SendInvitationHandler(mockService);
  });

  it('should delegate to InvitationService.sendById', async () => {
    mockService.sendById.mockResolvedValue(undefined);

    await handler.execute(new SendInvitationCommand(ctx, 'test-id'));

    expect(mockService.sendById).toHaveBeenCalledWith(ctx, 'test-id');
  });
});
