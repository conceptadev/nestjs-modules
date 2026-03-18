import {
  createMockContext,
  createMockOtpEntity,
  createMockOtpRepository,
  createMockRepositoryResolver,
  toOtpDomain,
} from '../../../../__tests__/helpers/mock.helpers';
import { Otp } from '../../../../domain/aggregates/otp';
import { FindActiveOtpQuery } from '../../impl/find-active-otp.query';
import { FindActiveOtpHandler } from '../find-active-otp.handler';

describe(FindActiveOtpHandler.name, () => {
  let handler: FindActiveOtpHandler;
  let mockRepo: ReturnType<typeof createMockOtpRepository>;

  const ctx = createMockContext();

  beforeEach(() => {
    mockRepo = createMockOtpRepository();
    const mockResolver = createMockRepositoryResolver(mockRepo);

    handler = new FindActiveOtpHandler(mockResolver);
  });

  it('should return an active OTP when found', async () => {
    const otp = toOtpDomain(createMockOtpEntity());
    mockRepo.findActiveByPasscode.mockResolvedValue(otp);

    const query = new FindActiveOtpQuery(ctx, {
      category: 'test-category',
      passcode: 'test-passcode',
    });

    const result = await handler.execute(query);

    expect(result).toBeInstanceOf(Otp);
    expect(result?.id).toBe('test-id');
  });

  it('should return null when no active OTP found', async () => {
    mockRepo.findActiveByPasscode.mockResolvedValue(null);

    const query = new FindActiveOtpQuery(ctx, {
      category: 'test-category',
      passcode: 'missing',
    });

    const result = await handler.execute(query);

    expect(result).toBeNull();
  });
});
