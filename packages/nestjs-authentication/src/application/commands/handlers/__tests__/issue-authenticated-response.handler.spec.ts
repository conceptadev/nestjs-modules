import { randomUUID } from 'crypto';

import { mock } from 'jest-mock-extended';

import { type EventPublisher } from '@nestjs/cqrs';

import { type Token } from '../../../../domain/aggregates/token.aggregate';
import { type AuthenticatedResponseInterface } from '../../../../domain/interfaces/authenticated-response.interface';
import { type JwtPolicy } from '../../../../domain/policies/jwt.policy';
import { type JwtPort } from '../../../../domain/ports/jwt.port';
import { IssueAuthenticatedResponseCommand } from '../../impl/issue-authenticated-response.command';
import { IssueAuthenticatedResponseHandler } from '../issue-authenticated-response.handler';

describe(IssueAuthenticatedResponseHandler.name, () => {
  const accessTokenStr = 'accessToken';
  const refreshTokenStr = 'refreshToken';
  const userId = randomUUID();
  const now = new Date();
  const accessExp = new Date(now.getTime() + 3600_000);
  const refreshExp = new Date(now.getTime() + 86_400_000);

  let handler: IssueAuthenticatedResponseHandler;
  let jwtPort: JwtPort;
  let jwtPolicy: JwtPolicy;
  let eventPublisher: EventPublisher;

  beforeEach(() => {
    jwtPort = mock<JwtPort>();
    jwtPolicy = mock<JwtPolicy>();
    eventPublisher = mock<EventPublisher>();

    jest.spyOn(jwtPort, 'signAccessToken').mockResolvedValue(accessTokenStr);
    jest.spyOn(jwtPort, 'signRefreshToken').mockResolvedValue(refreshTokenStr);
    jest.spyOn(jwtPolicy, 'getAccessExpiry').mockReturnValue(accessExp);
    jest.spyOn(jwtPolicy, 'getRefreshExpiry').mockReturnValue(refreshExp);
    jest
      .spyOn(eventPublisher, 'mergeObjectContext')
      .mockImplementation((agg) => agg as Token);

    handler = new IssueAuthenticatedResponseHandler(
      jwtPort,
      jwtPolicy,
      eventPublisher,
    );
  });

  it('should return response with accessToken and refreshToken', async () => {
    const command = new IssueAuthenticatedResponseCommand({}, userId);
    const result: AuthenticatedResponseInterface =
      await handler.execute(command);

    expect(result).toEqual({
      accessToken: accessTokenStr,
      refreshToken: refreshTokenStr,
    });
  });

  it('should sign access token with an access-type Token aggregate', async () => {
    const command = new IssueAuthenticatedResponseCommand({}, userId);
    await handler.execute(command);

    expect(jwtPort.signAccessToken).toHaveBeenCalledWith(
      {},
      expect.objectContaining({ sub: userId, type: 'access' }),
    );
  });

  it('should sign refresh token with a refresh-type Token aggregate', async () => {
    const command = new IssueAuthenticatedResponseCommand({}, userId);
    await handler.execute(command);

    expect(jwtPort.signRefreshToken).toHaveBeenCalledWith(
      {},
      expect.objectContaining({ sub: userId, type: 'refresh' }),
    );
  });
});
