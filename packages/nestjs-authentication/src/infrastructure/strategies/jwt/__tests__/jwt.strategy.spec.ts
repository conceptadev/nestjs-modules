import { randomUUID } from 'crypto';

import { mock } from 'jest-mock-extended';

import { type AuthorizationPayloadInterface } from '../../../../domain/interfaces/authorization-payload.interface';
import { JwtStrategyPolicy } from '../../../../domain/policies/jwt-strategy.policy';
import { type JwtPort } from '../../../../domain/ports/jwt.port';
import {
  type AuthenticationUserResult,
  type UserPort,
} from '../../../../domain/ports/user.port';
import { JwtUnauthorizedException } from '../exceptions/jwt-unauthorized.exception';
import { JwtStrategy } from '../jwt.strategy';

describe(JwtStrategy, () => {
  let user: NonNullable<AuthenticationUserResult>;
  let jwtPort: JwtPort;
  let userPort: UserPort;
  let jwtStrategy: JwtStrategy;
  let authorizationPayload: AuthorizationPayloadInterface;

  beforeEach(async () => {
    jwtPort = mock<JwtPort>();
    userPort = mock<UserPort>();
    jwtStrategy = new JwtStrategy(new JwtStrategyPolicy({}), jwtPort, userPort);
    authorizationPayload = mock<AuthorizationPayloadInterface>();
    user = {
      id: randomUUID(),
      email: 'test@example.com',
      username: 'test',
      active: true,
    };
  });

  describe(JwtStrategy.prototype.validate, () => {
    it('should return user', async () => {
      jest.spyOn(userPort, 'getBySubject').mockImplementationOnce(async () => {
        return user;
      });
      const userResponse = await jwtStrategy.validate(authorizationPayload, {});
      expect(userResponse.id).toBe(user.id);
    });

    it('should throw error', async () => {
      jest.spyOn(userPort, 'getBySubject').mockImplementationOnce(() => {
        return new Promise((resolve) => {
          resolve(null);
        });
      });
      const t = async () => {
        await jwtStrategy.validate(authorizationPayload, {});
      };
      await expect(t).rejects.toThrow(JwtUnauthorizedException);
    });
  });
});
