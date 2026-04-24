import { Inject } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

import { EventContextHost } from '@concepta/nestjs-common';

import { AUTHENTICATION_JWT_PORT_TOKEN } from '../../../authentication.constants';
import { Token } from '../../../domain/aggregates/token.aggregate';
import { JwtPolicy } from '../../../domain/policies/jwt.policy';
import { JwtPort } from '../../../domain/ports/jwt.port';
import { IssueRefreshTokenCommand } from '../impl/issue-refresh-token.command';

@CommandHandler(IssueRefreshTokenCommand)
export class IssueRefreshTokenHandler
  implements ICommandHandler<IssueRefreshTokenCommand, string>
{
  constructor(
    @Inject(AUTHENTICATION_JWT_PORT_TOKEN)
    private readonly jwtPort: JwtPort,
    @Inject(JwtPolicy)
    private readonly jwtPolicy: JwtPolicy,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: IssueRefreshTokenCommand): Promise<string> {
    const { ctx, payload } = command;
    const now = new Date();

    const token = this.eventPublisher.mergeObjectContext(
      Token.create(new EventContextHost({}, {}), {
        sub: payload.sub,
        type: 'refresh',
        iat: now,
        exp: this.jwtPolicy.getRefreshExpiry(now),
      }),
    );

    const signed = await this.jwtPort.signRefreshToken(ctx, token);
    token.commit();
    return signed;
  }
}
