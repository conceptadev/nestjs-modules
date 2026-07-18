import { type Provider } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { AUTHENTICATION_PASSWORD_PORT_TOKEN } from '../../authentication.constants.js';
import {
  PasswordPort,
  type PasswordPortSettings,
} from '../../domain/ports/password.port.js';

export function createPasswordPortProvider(
  portSettings: PasswordPortSettings,
): Provider {
  return {
    provide: AUTHENTICATION_PASSWORD_PORT_TOKEN,
    inject: [CommandBus],
    useFactory: (commandBus: CommandBus) =>
      new PasswordPort(portSettings, commandBus),
  };
}
