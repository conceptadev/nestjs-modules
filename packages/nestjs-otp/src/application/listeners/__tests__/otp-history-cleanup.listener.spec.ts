import {
  createMockEventContext,
  createMockOtpEntity,
  createMockOtpRepository,
  createMockOtpSettings,
  createMockRepositoryResolver,
  createMockTransaction,
} from '../../../__tests__/helpers/mock.helpers';
import { OtpCreatedEvent } from '../../../domain/events/otp-created.event';
import { OtpHistoryCleanupService } from '../../../domain/services/otp-history-cleanup.service';
import { type OtpSettingsInterface } from '../../../infrastructure/config/interfaces/otp-settings.interface';
import { OtpHistoryCleanupListener } from '../otp-history-cleanup.listener';

describe(OtpHistoryCleanupListener.name, () => {
  let listener: OtpHistoryCleanupListener;
  let mockSettings: OtpSettingsInterface;
  let historyCleanup: OtpHistoryCleanupService;

  beforeEach(() => {
    const mockRepo = createMockOtpRepository();
    const mockResolver = createMockRepositoryResolver(mockRepo);
    const mockTx = createMockTransaction();
    mockSettings = createMockOtpSettings();
    historyCleanup = new OtpHistoryCleanupService(mockResolver);
    vi.spyOn(historyCleanup, 'cleanup').mockResolvedValue();

    listener = new OtpHistoryCleanupListener(
      mockTx.transaction,
      historyCleanup,
      mockSettings,
    );
  });

  it('should call cleanup when keepHistoryDays is set', async () => {
    mockSettings.keepHistoryDays = 30;

    const eventContext = createMockEventContext();
    const otp = createMockOtpEntity();
    const event = new OtpCreatedEvent(eventContext, otp);

    await listener.handle(event);

    expect(historyCleanup.cleanup).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        assigneeId: otp.assigneeId,
        category: otp.category,
        keepHistoryDays: 30,
      }),
    );
  });

  it('should skip cleanup when keepHistoryDays is undefined', async () => {
    mockSettings.keepHistoryDays = undefined;

    const eventContext = createMockEventContext();
    const otp = createMockOtpEntity();
    const event = new OtpCreatedEvent(eventContext, otp);

    await listener.handle(event);

    expect(historyCleanup.cleanup).not.toHaveBeenCalled();
  });
});
