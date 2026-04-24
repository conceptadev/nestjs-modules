import { Provider } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { AUTHENTICATION_OTP_PORT_TOKEN } from '../../authentication.constants';
import { OtpPort, OtpPortSettings } from '../../domain/ports/otp.port';

export function createOtpPortProvider(portSettings: OtpPortSettings): Provider {
  return {
    provide: AUTHENTICATION_OTP_PORT_TOKEN,
    inject: [CommandBus, QueryBus],
    useFactory: (commandBus: CommandBus, queryBus: QueryBus) =>
      new OtpPort(portSettings, commandBus, queryBus),
  };
}
