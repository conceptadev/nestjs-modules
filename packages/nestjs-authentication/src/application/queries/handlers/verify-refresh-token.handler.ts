import { Inject, PlainLiteralObject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { AUTHENTICATION_JWT_PORT_TOKEN } from '../../../authentication.constants';
import { JwtPort } from '../../../domain/ports/jwt.port';
import { VerifyRefreshTokenQuery } from '../impl/verify-refresh-token.query';

@QueryHandler(VerifyRefreshTokenQuery)
export class VerifyRefreshTokenHandler implements IQueryHandler<
  VerifyRefreshTokenQuery,
  PlainLiteralObject
> {
  constructor(
    @Inject(AUTHENTICATION_JWT_PORT_TOKEN)
    private readonly jwtPort: JwtPort,
  ) {}

  async execute(query: VerifyRefreshTokenQuery): Promise<PlainLiteralObject> {
    const { ctx, token } = query;
    return this.jwtPort.verifyRefreshToken(ctx, token);
  }
}
