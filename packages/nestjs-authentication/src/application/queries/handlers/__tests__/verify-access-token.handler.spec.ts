import { mock } from 'jest-mock-extended';

import { type JwtPort } from '../../../../domain/ports/jwt.port';
import { VerifyAccessTokenQuery } from '../../impl/verify-access-token.query';
import { VerifyAccessTokenHandler } from '../verify-access-token.handler';

describe(VerifyAccessTokenHandler.name, () => {
  const token = 'token';
  const decoded = { sub: 'user-1' };
  let jwtPort: JwtPort;
  let handler: VerifyAccessTokenHandler;

  beforeEach(() => {
    jwtPort = mock<JwtPort>();
    jest.spyOn(jwtPort, 'verifyAccessToken').mockResolvedValue(decoded);
    handler = new VerifyAccessTokenHandler(jwtPort);
  });

  it('should return decoded token', async () => {
    const query = new VerifyAccessTokenQuery({}, token);
    const result = await handler.execute(query);
    expect(result).toEqual(decoded);
  });

  it('should throw error on verify failure', async () => {
    jest.spyOn(jwtPort, 'verifyAccessToken').mockRejectedValue(new Error());
    const query = new VerifyAccessTokenQuery({}, token);
    await expect(handler.execute(query)).rejects.toThrow();
  });
});
