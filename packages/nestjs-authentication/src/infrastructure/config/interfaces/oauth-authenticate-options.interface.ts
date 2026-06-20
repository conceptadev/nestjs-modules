import { OAuthParamsInterface } from './oauth-params.interface';

/**
 * Interface for OAuth authentication parameters that can be passed via query parameters
 */
export type OAuthAuthenticateOptionsInterface = Pick<
  OAuthParamsInterface,
  'state'
> & {
  /**
   * Callback URL for OAuth redirect
   */
  scope?: string[];
  callbackURL?: string;
};
