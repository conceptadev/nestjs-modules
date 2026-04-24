import { Provider } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';

import { AUTHENTICATION_RECOVERY_NOTIFICATION_PORT_TOKEN } from '../../authentication.constants';
import {
  RecoveryNotificationPort,
  RecoveryNotificationPortSettings,
} from '../../domain/ports/recovery-notification.port';

export function createRecoveryNotificationPortProvider(
  portSettings: RecoveryNotificationPortSettings,
): Provider {
  return {
    provide: AUTHENTICATION_RECOVERY_NOTIFICATION_PORT_TOKEN,
    inject: [CommandBus],
    useFactory: (commandBus: CommandBus) =>
      new RecoveryNotificationPort(portSettings, commandBus),
  };
}
