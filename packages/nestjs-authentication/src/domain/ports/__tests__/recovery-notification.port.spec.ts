import { mock } from 'vitest-mock-extended';

import { type PlainLiteralObject } from '@nestjs/common';
import { Command, type CommandBus } from '@nestjs/cqrs';

import {
  RecoveryNotificationPort,
  type RecoveryNotificationPortSettings,
  type SendPasswordUpdatedNotificationCommandInterface,
  type SendRecoverLoginNotificationCommandInterface,
  type SendRecoverPasswordNotificationCommandInterface,
} from '../recovery-notification.port.js';

class MockSendRecoverLoginCommand
  extends Command<void>
  implements SendRecoverLoginNotificationCommandInterface
{
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly email: string,
    public readonly username: string,
  ) {
    super();
  }
}

class MockSendRecoverPasswordCommand
  extends Command<void>
  implements SendRecoverPasswordNotificationCommandInterface
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

class MockSendPasswordUpdatedCommand
  extends Command<void>
  implements SendPasswordUpdatedNotificationCommandInterface
{
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly email: string,
  ) {
    super();
  }
}

describe(RecoveryNotificationPort.name, () => {
  let port: RecoveryNotificationPort;
  let commandBus: CommandBus;

  const portSettings: RecoveryNotificationPortSettings = {
    sendRecoverLoginNotificationCommand: MockSendRecoverLoginCommand,
    sendRecoverPasswordNotificationCommand: MockSendRecoverPasswordCommand,
    sendPasswordUpdatedNotificationCommand: MockSendPasswordUpdatedCommand,
  };

  beforeEach(() => {
    commandBus = mock<CommandBus>();
    port = new RecoveryNotificationPort(portSettings, commandBus);
  });

  describe('sendRecoverLogin', () => {
    it('should dispatch command via commandBus', () => {
      void commandBus.execute;
      vi.spyOn(commandBus, 'execute').mockResolvedValue(undefined);

      port.sendRecoverLogin({}, 'me@mail.com', 'username');

      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(MockSendRecoverLoginCommand),
      );
    });
  });

  describe('sendRecoverPassword', () => {
    it('should dispatch command via commandBus', () => {
      void commandBus.execute;
      vi.spyOn(commandBus, 'execute').mockResolvedValue(undefined);

      port.sendRecoverPassword({}, 'me@mail.com', {
        passcode: 'abc123',
        tokenExp: new Date(),
      });

      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(MockSendRecoverPasswordCommand),
      );
    });
  });

  describe('sendPasswordUpdated', () => {
    it('should dispatch command via commandBus', () => {
      void commandBus.execute;
      vi.spyOn(commandBus, 'execute').mockResolvedValue(undefined);

      port.sendPasswordUpdated({}, 'me@mail.com');

      expect(commandBus.execute).toHaveBeenCalledWith(
        expect.any(MockSendPasswordUpdatedCommand),
      );
    });
  });
});
