import { mock } from 'vitest-mock-extended';

import { type PlainLiteralObject } from '@nestjs/common';
import { Command, type CommandBus, type EventBus } from '@nestjs/cqrs';

import { NotificationSendFailedEvent } from '../../events/notification-send-failed.event.js';
import {
  type SendVerifyNotificationCommandInterface,
  VerifyNotificationPort,
  type VerifyNotificationPortSettings,
} from '../verify-notification.port.js';

class MockSendVerifyNotificationCommand
  extends Command<void>
  implements SendVerifyNotificationCommandInterface
{
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly email: string,
    public readonly passcode: string,
    public readonly tokenExp: Date,
  ) {
    super();
  }
}

const flush = () => new Promise<void>((resolve) => setImmediate(resolve));

describe(VerifyNotificationPort.name, () => {
  let port: VerifyNotificationPort;
  let commandBus: CommandBus;
  let eventBus: EventBus;

  const portSettings: VerifyNotificationPortSettings = {
    sendVerifyNotificationCommand: MockSendVerifyNotificationCommand,
  };

  beforeEach(() => {
    commandBus = mock<CommandBus>();
    eventBus = mock<EventBus>();
    port = new VerifyNotificationPort(portSettings, commandBus, eventBus);
  });

  describe('sendVerify', () => {
    it('should dispatch command via commandBus', () => {
      void commandBus.execute;
      vi.spyOn(commandBus, 'execute').mockResolvedValue(undefined);

      port.sendVerify({}, 'me@mail.com', {
        passcode: 'abc123',
        tokenExp: new Date(),
      });

      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(MockSendVerifyNotificationCommand),
      );
    });

    it('should not leave an unhandled rejection when the command fails', async () => {
      void commandBus.execute;
      vi.spyOn(commandBus, 'execute').mockRejectedValue(
        new Error('send failed'),
      );

      port.sendVerify({}, 'me@mail.com', {
        passcode: 'abc123',
        tokenExp: new Date(),
      });

      await expect(flush()).resolves.toBeUndefined();
    });

    it('should publish a NotificationSendFailedEvent when the command fails', async () => {
      void commandBus.execute;
      const error = new Error('send failed');
      vi.spyOn(commandBus, 'execute').mockRejectedValue(error);

      port.sendVerify({}, 'me@mail.com', {
        passcode: 'abc123',
        tokenExp: new Date(),
      });

      await flush();

      expect(eventBus.publish).toHaveBeenCalledWith(
        new NotificationSendFailedEvent(
          {},
          'me@mail.com',
          MockSendVerifyNotificationCommand,
          error,
        ),
      );
    });
  });
});
