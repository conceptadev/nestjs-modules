import { Provider } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { AUTHENTICATION_USER_PORT_TOKEN } from '../../authentication.constants';
import { UserPort, UserPortSettings } from '../../domain/ports/user.port';

export function createUserPortProvider(
  portSettings: UserPortSettings,
): Provider {
  return {
    provide: AUTHENTICATION_USER_PORT_TOKEN,
    inject: [QueryBus, CommandBus],
    useFactory: (queryBus: QueryBus, commandBus: CommandBus) =>
      new UserPort(portSettings, queryBus, commandBus),
  };
}
