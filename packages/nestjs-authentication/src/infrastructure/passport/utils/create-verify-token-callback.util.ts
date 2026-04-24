import { JwtPort } from '../../../domain/ports/jwt.port';
import { JwtVerifyTokenCallback } from '../jwt-passport.types';

export const createVerifyTokenCallback = (
  jwtPort: JwtPort,
  type: 'access' | 'refresh',
): JwtVerifyTokenCallback => {
  return (
    token: string,
    done: (error?: Error, decodedToken?: unknown) => void,
  ): void => {
    const verify =
      type === 'access'
        ? jwtPort.verifyAccessToken.bind(jwtPort)
        : jwtPort.verifyRefreshToken.bind(jwtPort);
    verify({}, token)
      .then((decodedToken: unknown) => done(undefined, decodedToken))
      .catch((error) => done(error));
  };
};
