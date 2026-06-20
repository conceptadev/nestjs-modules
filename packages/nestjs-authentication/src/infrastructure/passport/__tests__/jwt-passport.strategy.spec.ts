import { mock } from 'jest-mock-extended';

import { NotAnErrorException } from '@concepta/nestjs-core';

import { JwtPassportOptionsInterface } from '../interfaces/jwt-passport-options.interface';
import { JwtPassportStrategy } from '../jwt-passport.strategy';

describe(JwtPassportStrategy, () => {
  let jwtStrategyOptions: JwtPassportOptionsInterface;
  let verifyCallback: (...args: unknown[]) => void;
  let jwtStrategy: JwtPassportStrategy;

  beforeEach(async () => {
    jwtStrategyOptions = mock<JwtPassportOptionsInterface>({
      jwtFromRequest: () => 'rawToken',
      verifyToken: () => true,
    });
    verifyCallback = jest.fn();
    jwtStrategy = new JwtPassportStrategy(jwtStrategyOptions, verifyCallback);
  });

  describe(JwtPassportStrategy.prototype.authenticate, () => {
    let req: Parameters<typeof jwtStrategy.authenticate>[0];
    it('should success', async () => {
      const userResponse = jwtStrategy.authenticate(req);
      expect(userResponse).toBe(true);
    });

    it('should throw when jwtFromRequest returns empty string', () => {
      jest.spyOn(jwtStrategyOptions, 'jwtFromRequest').mockReturnValue('');
      expect(() => jwtStrategy.authenticate(req)).toThrow();
    });

    it('should throw when verifyToken throws a standard Error', () => {
      jest
        .spyOn(jwtStrategyOptions, 'verifyToken')
        .mockImplementationOnce(() => {
          throw new Error();
        });
      expect(() => jwtStrategy.authenticate(req)).toThrow();
    });

    it('should throw when verifyToken throws a NotAnErrorException', () => {
      jest
        .spyOn(jwtStrategyOptions, 'verifyToken')
        .mockImplementationOnce(() => {
          throw new NotAnErrorException(new Error());
        });
      expect(() => jwtStrategy.authenticate(req)).toThrow();
    });
  });
});
