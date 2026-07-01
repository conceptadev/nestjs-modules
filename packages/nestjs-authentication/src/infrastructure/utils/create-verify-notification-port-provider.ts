import { type Provider } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { AUTHENTICATION_VERIFY_NOTIFICATION_PORT_TOKEN } from '../../authentication.constants';
import {
  VerifyNotificationPort,
  type VerifyNotificationPortSettings,
} from '../../domain/ports/verify-notification.port';

export function createVerifyNotificationPortProvider(
  portSettings: VerifyNotificationPortSettings,
): Provider {
  return {
    provide: AUTHENTICATION_VERIFY_NOTIFICATION_PORT_TOKEN,
    inject: [CommandBus],
    useFactory: (commandBus: CommandBus) =>
      new VerifyNotificationPort(portSettings, commandBus),
  };
}
