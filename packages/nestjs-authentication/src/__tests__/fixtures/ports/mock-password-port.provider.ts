import { PlainLiteralObject, Provider } from '@nestjs/common';
import { Command, ICommandHandler, CommandHandler } from '@nestjs/cqrs';

import { ReferenceId, ReferenceIdInterface } from '@concepta/rockets-app';

import {
  PasswordPortSettings,
  SetPasswordCommandInterface,
  ValidatePasswordCommandInterface,
} from '../../../domain/ports/password.port';
import { createPasswordPortProvider } from '../../../infrastructure/utils/create-password-port-provider';

// ── Mock commands ──

export class MockValidatePasswordCommand
  extends Command<boolean>
  implements ValidatePasswordCommandInterface
{
  constructor(
    public ctx: PlainLiteralObject,
    public password: string,
    public target: ReferenceIdInterface,
  ) {
    super();
  }
}

export class MockSetPasswordCommand
  extends Command<void>
  implements SetPasswordCommandInterface
{
  constructor(
    public ctx: PlainLiteralObject,
    public password: string,
    public assigneeId: ReferenceId,
  ) {
    super();
  }
}

// ── Mock handlers ──

@CommandHandler(MockValidatePasswordCommand)
export class MockValidatePasswordHandler
  implements ICommandHandler<MockValidatePasswordCommand>
{
  async execute(_command: MockValidatePasswordCommand): Promise<boolean> {
    return true;
  }
}

@CommandHandler(MockSetPasswordCommand)
export class MockSetPasswordHandler
  implements ICommandHandler<MockSetPasswordCommand>
{
  async execute(_command: MockSetPasswordCommand): Promise<void> {
    return;
  }
}

// ── Port settings ──

export const mockPasswordPortSettings: PasswordPortSettings = {
  validateCommand: MockValidatePasswordCommand,
  setPasswordCommand: MockSetPasswordCommand,
};

// ── Reusable mock handlers array ──

export const mockPasswordPortHandlers = [
  MockValidatePasswordHandler,
  MockSetPasswordHandler,
];

// ── Provider factory ──

export function createMockPasswordPortProvider(
  settings: PasswordPortSettings = mockPasswordPortSettings,
): Provider {
  return createPasswordPortProvider(settings);
}
