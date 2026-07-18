import { mock } from 'vitest-mock-extended';

import { type PlainLiteralObject } from '@nestjs/common';
import { Command, type CommandBus } from '@nestjs/cqrs';

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

describe(VerifyNotificationPort.name, () => {
  let port: VerifyNotificationPort;
  let commandBus: CommandBus;

  const portSettings: VerifyNotificationPortSettings = {
    sendVerifyNotificationCommand: MockSendVerifyNotificationCommand,
  };

  beforeEach(() => {
    commandBus = mock<CommandBus>();
    port = new VerifyNotificationPort(portSettings, commandBus);
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
  });
});
