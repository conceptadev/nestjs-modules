import { Provider } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AuthenticationOptionsExtrasInterface } from '../config/interfaces/authentication-options-extras.interface';
import { AuthenticationOptionsInterface } from '../config/interfaces/authentication-options.interface';
import { JwtGuard } from '../strategies/jwt/jwt.guard';

export function createJwtAppGuardProvider(
  rawOptionsToken: symbol,
  extras: AuthenticationOptionsExtrasInterface,
): Provider {
  return {
    provide: APP_GUARD,
    inject: [rawOptionsToken, JwtGuard],
    useFactory: (
      options: AuthenticationOptionsInterface,
      defaultGuard: JwtGuard,
    ) => {
      if (!options.settings?.strategies?.jwt) return null;
      if (extras.appGuard === false) return null;
      return extras.appGuard ?? defaultGuard;
    },
  };
}
