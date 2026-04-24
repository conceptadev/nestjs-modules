import { Request } from 'express';

import { OAuthParamsInterface } from './oauth-params.interface';

/**
 * Interface for OAuth authentication request with query parameters
 */
export interface OAuthRequestInterface extends Request {
  query: OAuthParamsInterface;
}
