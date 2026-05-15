import { AuthenticationAccessInterface } from './authentication-access.interface';
import { AuthenticationRefreshInterface } from './authentication-refresh.interface';

/**
 * Authentication response interface
 */
export interface AuthenticatedResponseInterface
  extends AuthenticationAccessInterface,
    AuthenticationRefreshInterface {}
