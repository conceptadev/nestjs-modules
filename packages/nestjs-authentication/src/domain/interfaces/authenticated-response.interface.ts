import { type AuthenticationAccessInterface } from './authentication-access.interface';
import { type AuthenticationRefreshInterface } from './authentication-refresh.interface';

/**
 * Authentication response interface
 */
export interface AuthenticatedResponseInterface
  extends AuthenticationAccessInterface, AuthenticationRefreshInterface {}
