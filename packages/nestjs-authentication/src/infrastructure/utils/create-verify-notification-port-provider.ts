import { type Provider } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { AUTHENTICATION_VERIFY_NOTIFICATION_PORT_TOKEN } from '../../authentication.constants.js';
import { VerifyNotificationPort } from '../../domain/ports/verify-notification.port.js';
import { type AuthenticationOptionsInterface } from '../config/interfaces/authentication-options.interface.js';

export function createVerifyNotificationPortProvider(
  rawOptionsToken: symbol,
): Provider {
  return {
    provide: AUTHENTICATION_VERIFY_NOTIFICATION_PORT_TOKEN,
    inject: [rawOptionsToken, CommandBus],
    useFactory: (
      options: AuthenticationOptionsInterface,
      commandBus: CommandBus,
    ) =>
      options.ports?.verifyNotification
        ? new VerifyNotificationPort(
            options.ports.verifyNotification,
            commandBus,
          )
        : null,
  };
}
