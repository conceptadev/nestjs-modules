import { CanActivate, DynamicModule } from '@nestjs/common';

import { AuthRouterGuardConfigInterface } from '../../router/interfaces/auth-router-guard-config.interface';

export interface AuthenticationOptionsExtrasInterface extends Pick<
  DynamicModule,
  'global'
> {
  /**
   * APP_GUARD configuration. Set to `false` to disable the global guard.
   * Only applies when `settings.jwt` is configured.
   */
  appGuard?: false | CanActivate;

  /**
   * Auth router guard configurations.
   * Each entry registers a named guard for route-based authentication.
   */
  guards?: AuthRouterGuardConfigInterface[];
}
