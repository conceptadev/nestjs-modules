import { Provider } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { AUTHENTICATION_PASSWORD_PORT_TOKEN } from '../../authentication.constants';
import {
  PasswordPort,
  PasswordPortSettings,
} from '../../domain/ports/password.port';

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
