import { StrategyOptions } from 'passport-jwt';

import { JwtVerifyTokenCallback } from '../jwt-passport.types';

export interface JwtPassportOptionsInterface
  extends Pick<StrategyOptions, 'jwtFromRequest'> {
  verifyToken: JwtVerifyTokenCallback;
}
