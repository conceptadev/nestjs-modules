import { mock } from 'jest-mock-extended';

import { JwtPort } from '../../../../domain/ports/jwt.port';
import { UserPort } from '../../../../domain/ports/user.port';
import { AuthenticationAccessTokenException } from '../../../exceptions/authentication-access-token.exception';
import { ValidateAndVerifyAccessTokenQuery } from '../../impl/validate-and-verify-access-token.query';
import { ValidateAndVerifyAccessTokenHandler } from '../validate-and-verify-access-token.handler';

describe(ValidateAndVerifyAccessTokenHandler.name, () => {
  const token = 'access-token';
  const payload = { sub: 'user-1' };
  const user = { id: 'user-1' };

  describe('with UserPort', () => {
    let jwtPort: JwtPort;
    let userPort: UserPort;
    let handler: ValidateAndVerifyAccessTokenHandler;

    beforeEach(() => {
      jwtPort = mock<JwtPort>();
      userPort = mock<UserPort>();
      jest.spyOn(jwtPort, 'verifyAccessToken').mockResolvedValue(payload);
      handler = new ValidateAndVerifyAccessTokenHandler(jwtPort, userPort);
    });

    it('should return payload when token is valid and user is found', async () => {
      jest.spyOn(userPort, 'getBySubject').mockResolvedValue(user as never);
      const query = new ValidateAndVerifyAccessTokenQuery({}, token);
      const result = await handler.execute(query);
      expect(result).toEqual(payload);
    });

    it('should throw AuthenticationAccessTokenException when user is not found', async () => {
      jest.spyOn(userPort, 'getBySubject').mockResolvedValue(null);
      const query = new ValidateAndVerifyAccessTokenQuery({}, token);
      await expect(handler.execute(query)).rejects.toThrow(
        AuthenticationAccessTokenException,
      );
    });

    it('should throw when JWT verify fails', async () => {
      jest
        .spyOn(jwtPort, 'verifyAccessToken')
        .mockRejectedValue(new Error('invalid'));
      const query = new ValidateAndVerifyAccessTokenQuery({}, token);
      await expect(handler.execute(query)).rejects.toThrow();
    });
  });

  describe('without UserPort', () => {
    let jwtPort: JwtPort;
    let handler: ValidateAndVerifyAccessTokenHandler;

    beforeEach(() => {
      jwtPort = mock<JwtPort>();
      jest.spyOn(jwtPort, 'verifyAccessToken').mockResolvedValue(payload);
      handler = new ValidateAndVerifyAccessTokenHandler(jwtPort, null);
    });

    it('should return payload without user validation', async () => {
      const query = new ValidateAndVerifyAccessTokenQuery({}, token);
      const result = await handler.execute(query);
      expect(result).toEqual(payload);
    });
  });
});
