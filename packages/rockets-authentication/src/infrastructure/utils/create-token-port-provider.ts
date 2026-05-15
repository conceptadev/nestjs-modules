import { Provider } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';

import { IssueAccessTokenCommand } from '../../application/commands/impl/issue-access-token.command';
import { IssueRefreshTokenCommand } from '../../application/commands/impl/issue-refresh-token.command';
import { ValidateTokenQuery } from '../../application/queries/impl/validate-token.query';
import { VerifyAccessTokenQuery } from '../../application/queries/impl/verify-access-token.query';
import { VerifyRefreshTokenQuery } from '../../application/queries/impl/verify-refresh-token.query';
import { AUTHENTICATION_TOKEN_PORT_TOKEN } from '../../authentication.constants';
import { TokenPort, TokenPortSettings } from '../../domain/ports/token.port';

export const DEFAULT_TOKEN_PORT_SETTINGS: TokenPortSettings = {
  issueAccessTokenCommand: IssueAccessTokenCommand,
  issueRefreshTokenCommand: IssueRefreshTokenCommand,
  verifyAccessTokenQuery: VerifyAccessTokenQuery,
  verifyRefreshTokenQuery: VerifyRefreshTokenQuery,
  validateTokenQuery: ValidateTokenQuery,
};

export function createTokenPortProvider(
  portSettings: TokenPortSettings,
): Provider {
  return {
    provide: AUTHENTICATION_TOKEN_PORT_TOKEN,
    inject: [CommandBus, QueryBus],
    useFactory: (commandBus: CommandBus, queryBus: QueryBus) =>
      new TokenPort(portSettings, commandBus, queryBus),
  };
}
