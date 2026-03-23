import {
  createMockInvitationRepository,
  createMockInvitationContext,
  createMockInvitationEntity,
  toInvitationDomain,
} from '../../../../__tests__/helpers/mock.helpers';
import { Invitation } from '../../../../domain/aggregates/invitation';
import { GetInvitationQuery } from '../../impl/get-invitation.query';
import { GetInvitationHandler } from '../get-invitation.handler';

describe(GetInvitationHandler.name, () => {
  const ctx = createMockInvitationContext();
  let mockRepo: ReturnType<typeof createMockInvitationRepository>;
  let handler: GetInvitationHandler;

  beforeEach(() => {
    mockRepo = createMockInvitationRepository();
    handler = new GetInvitationHandler(mockRepo);
  });

  it('should return the Invitation when found', async () => {
    mockRepo.get.mockResolvedValue(
      toInvitationDomain(createMockInvitationEntity()),
    );

    const result = await handler.execute(
      new GetInvitationQuery(ctx, 'test-id'),
    );

    expect(result).toBeInstanceOf(Invitation);
    expect(result!.id).toBe('test-id');
  });

  it('should return null when not found', async () => {
    mockRepo.get.mockResolvedValue(null);

    const result = await handler.execute(
      new GetInvitationQuery(ctx, 'missing-id'),
    );

    expect(result).toBeNull();
  });
});
