import {
  createMockContext,
  createMockOtpRepository,
  createMockOtpSettings,
  createMockRepositoryResolver,
  createMockTransaction,
  DEFAULT_OTP_NAMESPACE,
} from '../../../../__tests__/helpers/mock.helpers';
import { OtpHistoryCleanupService } from '../../../../domain/services/otp-history-cleanup.service';
import { ClearOtpHistoryCommand } from '../../impl/clear-otp-history.command';
import { ClearOtpHistoryHandler } from '../clear-otp-history.handler';

describe(ClearOtpHistoryHandler.name, () => {
  let handler: ClearOtpHistoryHandler;
  let mockSettings: ReturnType<typeof createMockOtpSettings>;
  let historyCleanup: OtpHistoryCleanupService;

  const ctx = createMockContext();

  beforeEach(() => {
    const mockRepo = createMockOtpRepository();
    const mockResolver = createMockRepositoryResolver(mockRepo);
    const mockTx = createMockTransaction();
    mockSettings = createMockOtpSettings();
    historyCleanup = new OtpHistoryCleanupService(mockResolver);
    jest.spyOn(historyCleanup, 'cleanup').mockResolvedValue();

    handler = new ClearOtpHistoryHandler(
      mockTx.transaction,
      historyCleanup,
      mockSettings,
    );
  });

  it('should call cleanup when keepHistoryDays is set', async () => {
    mockSettings.keepHistoryDays = 30;

    const command = new ClearOtpHistoryCommand(ctx, DEFAULT_OTP_NAMESPACE, {
      assigneeId: 'test-assignee',
      category: 'test-category',
    });

    await handler.execute(command);

    expect(historyCleanup.cleanup).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        assigneeId: 'test-assignee',
        category: 'test-category',
        keepHistoryDays: 30,
      }),
    );
  });

  it('should call cleanup when keepHistoryDays is 0', async () => {
    mockSettings.keepHistoryDays = 0;

    const command = new ClearOtpHistoryCommand(ctx, DEFAULT_OTP_NAMESPACE, {
      assigneeId: 'test-assignee',
      category: 'test-category',
    });

    await handler.execute(command);

    expect(historyCleanup.cleanup).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        keepHistoryDays: 0,
      }),
    );
  });

  it('should early return when keepHistoryDays is undefined', async () => {
    mockSettings.keepHistoryDays = undefined;

    const command = new ClearOtpHistoryCommand(ctx, DEFAULT_OTP_NAMESPACE, {
      assigneeId: 'test-assignee',
      category: 'test-category',
    });

    await handler.execute(command);

    expect(historyCleanup.cleanup).not.toHaveBeenCalled();
  });

  it('should use command keepHistoryDays override over settings', async () => {
    mockSettings.keepHistoryDays = 30;

    const command = new ClearOtpHistoryCommand(
      ctx,
      DEFAULT_OTP_NAMESPACE,
      { assigneeId: 'test-assignee', category: 'test-category' },
      { keepHistoryDays: 7 },
    );

    await handler.execute(command);

    expect(historyCleanup.cleanup).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        keepHistoryDays: 7,
      }),
    );
  });

  it('should use command keepHistoryDays of 0 to override settings', async () => {
    mockSettings.keepHistoryDays = 30;

    const command = new ClearOtpHistoryCommand(
      ctx,
      DEFAULT_OTP_NAMESPACE,
      { assigneeId: 'test-assignee', category: 'test-category' },
      { keepHistoryDays: 0 },
    );

    await handler.execute(command);

    expect(historyCleanup.cleanup).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        keepHistoryDays: 0,
      }),
    );
  });

  it('should fall back to settings when command keepHistoryDays is undefined', async () => {
    mockSettings.keepHistoryDays = undefined;

    const command = new ClearOtpHistoryCommand(ctx, DEFAULT_OTP_NAMESPACE, {
      assigneeId: 'test-assignee',
      category: 'test-category',
    });

    await handler.execute(command);

    expect(historyCleanup.cleanup).not.toHaveBeenCalled();
  });
});
