import { mock } from 'jest-mock-extended';

import { type JwtPort } from '../../../../domain/ports/jwt.port';
import { type UserPort } from '../../../../domain/ports/user.port';
import { AuthenticationRefreshTokenException } from '../../../exceptions/authentication-refresh-token.exception';
import { ValidateAndVerifyRefreshTokenQuery } from '../../impl/validate-and-verify-refresh-token.query';
import { ValidateAndVerifyRefreshTokenHandler } from '../validate-and-verify-refresh-token.handler';

describe(ValidateAndVerifyRefreshTokenHandler.name, () => {
  const token = 'refresh-token';
  const payload = { sub: 'user-1' };
  const user = { id: 'user-1' };

  describe('with UserPort', () => {
    let jwtPort: JwtPort;
    let userPort: UserPort;
    let handler: ValidateAndVerifyRefreshTokenHandler;

    beforeEach(() => {
      jwtPort = mock<JwtPort>();
      userPort = mock<UserPort>();
      jest.spyOn(jwtPort, 'verifyRefreshToken').mockResolvedValue(payload);
      handler = new ValidateAndVerifyRefreshTokenHandler(jwtPort, userPort);
    });

    it('should return payload when token is valid and user is found', async () => {
      jest.spyOn(userPort, 'getBySubject').mockResolvedValue(user as never);
      const query = new ValidateAndVerifyRefreshTokenQuery({}, token);
      const result = await handler.execute(query);
      expect(result).toEqual(payload);
    });

    it('should throw AuthenticationRefreshTokenException when user is not found', async () => {
      jest.spyOn(userPort, 'getBySubject').mockResolvedValue(null);
      const query = new ValidateAndVerifyRefreshTokenQuery({}, token);
      await expect(handler.execute(query)).rejects.toThrow(
        AuthenticationRefreshTokenException,
      );
    });

    it('should throw when JWT verify fails', async () => {
      jest
        .spyOn(jwtPort, 'verifyRefreshToken')
        .mockRejectedValue(new Error('invalid'));
      const query = new ValidateAndVerifyRefreshTokenQuery({}, token);
      await expect(handler.execute(query)).rejects.toThrow();
    });
  });

  describe('without UserPort', () => {
    let jwtPort: JwtPort;
    let handler: ValidateAndVerifyRefreshTokenHandler;

    beforeEach(() => {
      jwtPort = mock<JwtPort>();
      jest.spyOn(jwtPort, 'verifyRefreshToken').mockResolvedValue(payload);
      handler = new ValidateAndVerifyRefreshTokenHandler(jwtPort, null);
    });

    it('should return payload without user validation', async () => {
      const query = new ValidateAndVerifyRefreshTokenQuery({}, token);
      const result = await handler.execute(query);
      expect(result).toEqual(payload);
    });
  });
});
