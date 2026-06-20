import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { JwtService } from '../../../infrastructure/jwt/jwt.service';
import { JwtVerifyRefreshTokenQuery } from '../impl/jwt-verify-refresh-token.query';

@QueryHandler(JwtVerifyRefreshTokenQuery)
export class JwtVerifyRefreshTokenHandler implements IQueryHandler<
  JwtVerifyRefreshTokenQuery,
  object
> {
  constructor(private readonly jwtService: JwtService) {}

  async execute(query: JwtVerifyRefreshTokenQuery): Promise<object> {
    return this.jwtService.verifyRefreshToken(query.token);
  }
}
