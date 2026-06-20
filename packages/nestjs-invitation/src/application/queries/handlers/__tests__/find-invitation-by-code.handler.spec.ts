import {
  createMockInvitationRepository,
  createMockInvitationEntity,
  toInvitationDomain,
} from '../../../../__tests__/helpers/mock.helpers';
import { Invitation } from '../../../../domain/aggregates/invitation';
import { FindInvitationByCodeQuery } from '../../impl/find-invitation-by-code.query';
import { FindInvitationByCodeHandler } from '../find-invitation-by-code.handler';

describe(FindInvitationByCodeHandler.name, () => {
  const ctx = {};
  let mockRepo: ReturnType<typeof createMockInvitationRepository>;
  let handler: FindInvitationByCodeHandler;

  beforeEach(() => {
    mockRepo = createMockInvitationRepository();
    handler = new FindInvitationByCodeHandler(mockRepo);
  });

  it('should return the Invitation when found', async () => {
    mockRepo.findOneByCode.mockResolvedValue(
      toInvitationDomain(createMockInvitationEntity()),
    );

    const result = await handler.execute(
      new FindInvitationByCodeQuery(ctx, 'test-code'),
    );

    expect(result).toBeInstanceOf(Invitation);
    expect(result?.code).toBe('test-code');
  });

  it('should return null when not found', async () => {
    mockRepo.findOneByCode.mockResolvedValue(null);

    const result = await handler.execute(
      new FindInvitationByCodeQuery(ctx, 'missing-code'),
    );

    expect(result).toBeNull();
  });
});
