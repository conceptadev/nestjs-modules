import {
  createMockContext,
  createMockOtpEntity,
  createMockOtpRepository,
  createMockRepositoryResolver,
  createMockTransaction,
} from '../../../../__tests__/helpers/mock.helpers';
import { Otp } from '../../../../domain/aggregates/otp';
import { ClearOtpsCommand } from '../../impl/clear-otps.command';
import { ClearOtpsHandler } from '../clear-otps.handler';

describe(ClearOtpsHandler.name, () => {
  let handler: ClearOtpsHandler;
  let mockRepo: ReturnType<typeof createMockOtpRepository>;

  const ctx = createMockContext();

  beforeEach(() => {
    mockRepo = createMockOtpRepository();
    const mockResolver = createMockRepositoryResolver(mockRepo);
    const mockTx = createMockTransaction();

    handler = new ClearOtpsHandler(mockResolver, mockTx.transaction);
  });

  it('should find and remove all OTPs for assignee and category', async () => {
    const otps = [
      Otp.toInstance(createMockOtpEntity({ id: '1' })),
      Otp.toInstance(createMockOtpEntity({ id: '2' })),
    ];
    mockRepo.findAllByAssigneeAndCategory.mockResolvedValue(otps);

    const command = new ClearOtpsCommand(ctx, {
      assigneeId: 'test-assignee',
      category: 'test-category',
    });

    await handler.execute(command);

    expect(mockRepo.findAllByAssigneeAndCategory).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        assigneeId: 'test-assignee',
        category: 'test-category',
      }),
    );
    expect(mockRepo.removeAll).toHaveBeenCalledWith(expect.anything(), otps);
  });

  it('should not call removeAll when no OTPs found', async () => {
    mockRepo.findAllByAssigneeAndCategory.mockResolvedValue([]);

    const command = new ClearOtpsCommand(ctx, {
      assigneeId: 'test-assignee',
      category: 'test-category',
    });

    await handler.execute(command);

    expect(mockRepo.removeAll).not.toHaveBeenCalled();
  });
});
