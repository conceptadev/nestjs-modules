import { randomUUID } from 'crypto';

import { mock } from 'jest-mock-extended';

import { AuthorizationPayloadInterface } from '../../../../domain/interfaces/authorization-payload.interface';
import { RefreshStrategyPolicy } from '../../../../domain/policies/refresh-strategy.policy';
import { JwtPort } from '../../../../domain/ports/jwt.port';
import {
  AuthenticationUserResult,
  UserPort,
} from '../../../../domain/ports/user.port';
import { RefreshUnauthorizedException } from '../exceptions/refresh-unauthorized.exception';
import { RefreshStrategy } from '../refresh.strategy';

describe(RefreshStrategy, () => {
  const USERNAME = 'username';

  let user: NonNullable<AuthenticationUserResult>;
  let userPort: UserPort;
  let jwtPort: JwtPort;
  let refreshStrategy: RefreshStrategy;
  let authorizationPayloadInterface: AuthorizationPayloadInterface;

  beforeEach(async () => {
    userPort = mock<UserPort>();
    jwtPort = mock<JwtPort>();
    refreshStrategy = new RefreshStrategy(
      new RefreshStrategyPolicy({}),
      jwtPort,
      userPort,
    );

    user = {
      id: randomUUID(),
      email: 'test@example.com',
      username: 'test',
      active: true,
    };

    authorizationPayloadInterface = {
      sub: USERNAME,
    };

    jest.spyOn(userPort, 'getBySubject').mockResolvedValue(user);
  });

  describe(RefreshStrategy.prototype.validate, () => {
    it('should return user', async () => {
      const result = await refreshStrategy.validate(
        authorizationPayloadInterface,
        {},
      );
      expect(result.id).toBe(user.id);
    });

    it(`should throw UnauthorizedException`, async () => {
      jest.spyOn(userPort, 'getBySubject').mockResolvedValue(null);

      const t = () =>
        refreshStrategy.validate(authorizationPayloadInterface, {});
      await expect(t).rejects.toThrow(RefreshUnauthorizedException);
    });
  });
});
