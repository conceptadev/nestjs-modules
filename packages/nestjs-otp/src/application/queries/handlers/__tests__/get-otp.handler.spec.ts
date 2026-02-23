import {
  createMockContext,
  createMockOtpEntity,
  createMockOtpRepository,
  createMockRepositoryResolver,
} from '../../../../__tests__/helpers/mock.helpers';
import { Otp } from '../../../../domain/aggregates/otp';
import { OtpNotFoundException } from '../../../../infrastructure/persistence/exceptions/otp-not-found.exception';
import { GetOtpQuery } from '../../impl/get-otp.query';
import { GetOtpHandler } from '../get-otp.handler';

describe(GetOtpHandler.name, () => {
  let handler: GetOtpHandler;
  let mockRepo: ReturnType<typeof createMockOtpRepository>;

  const ctx = createMockContext();

  beforeEach(() => {
    mockRepo = createMockOtpRepository();
    const mockResolver = createMockRepositoryResolver(mockRepo);

    handler = new GetOtpHandler(mockResolver);
  });

  it('should return an OTP by id', async () => {
    const otp = Otp.toInstance(createMockOtpEntity());
    mockRepo.get.mockResolvedValue(otp);

    const query = new GetOtpQuery(ctx, 'test-id');

    const result = await handler.execute(query);

    expect(result).toBeInstanceOf(Otp);
    expect(result.id).toBe('test-id');
    expect(mockRepo.get).toHaveBeenCalledWith(expect.anything(), 'test-id');
  });

  it('should propagate OtpNotFoundException when not found', async () => {
    mockRepo.get.mockRejectedValue(new OtpNotFoundException({ id: 'missing' }));

    const query = new GetOtpQuery(ctx, 'missing');

    await expect(handler.execute(query)).rejects.toThrow(OtpNotFoundException);
  });
});
