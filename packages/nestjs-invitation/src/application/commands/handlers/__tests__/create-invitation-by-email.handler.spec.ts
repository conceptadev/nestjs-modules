import {
  createMockInvitationService,
  createMockInvitationContext,
  createMockInvitationEntity,
  toInvitationDomain,
} from '../../../../__tests__/helpers/mock.helpers';
import { Invitation } from '../../../../domain/aggregates/invitation';
import { InvitationService } from '../../../../domain/services/invitation.service';
import { CreateInvitationByEmailCommand } from '../../impl/create-invitation-by-email.command';
import { CreateInvitationByEmailHandler } from '../create-invitation-by-email.handler';

describe(CreateInvitationByEmailHandler.name, () => {
  const ctx = createMockInvitationContext();
  let mockService: jest.Mocked<InvitationService>;
  let handler: CreateInvitationByEmailHandler;

  beforeEach(() => {
    mockService = createMockInvitationService();
    handler = new CreateInvitationByEmailHandler(mockService);
  });

  it('should delegate to InvitationService.createByEmail', async () => {
    const invitation = toInvitationDomain(createMockInvitationEntity());
    mockService.createByEmail.mockResolvedValue(invitation);

    const dto = {
      email: 'test@example.com',
      category: 'user',
      constraints: { role: 'admin' },
    };

    const result = await handler.execute(
      new CreateInvitationByEmailCommand(ctx, dto),
    );

    expect(result).toBeInstanceOf(Invitation);
    expect(mockService.createByEmail).toHaveBeenCalledWith(ctx, dto);
  });
});
