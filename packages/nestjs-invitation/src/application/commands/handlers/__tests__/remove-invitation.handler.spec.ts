import {
  createMockInvitationService,
  createMockInvitationContext,
  createMockInvitationEntity,
  toInvitationDomain,
} from '../../../../__tests__/helpers/mock.helpers';
import { Invitation } from '../../../../domain/aggregates/invitation';
import { InvitationService } from '../../../../domain/services/invitation.service';
import { RemoveInvitationCommand } from '../../impl/remove-invitation.command';
import { RemoveInvitationHandler } from '../remove-invitation.handler';

describe(RemoveInvitationHandler.name, () => {
  const ctx = createMockInvitationContext();
  let mockService: jest.Mocked<InvitationService>;
  let handler: RemoveInvitationHandler;

  beforeEach(() => {
    mockService = createMockInvitationService();
    handler = new RemoveInvitationHandler(mockService);
  });

  it('should delegate to InvitationService.remove', async () => {
    const invitation = toInvitationDomain(createMockInvitationEntity());
    mockService.remove.mockResolvedValue(invitation);

    const result = await handler.execute(
      new RemoveInvitationCommand(ctx, 'test-id'),
    );

    expect(result).toBeInstanceOf(Invitation);
    expect(mockService.remove).toHaveBeenCalledWith(ctx, 'test-id');
  });
});
