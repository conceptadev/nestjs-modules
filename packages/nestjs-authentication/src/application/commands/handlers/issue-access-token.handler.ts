import { Inject } from '@nestjs/common';
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';

import { EventContextHost } from '@concepta/rockets-app';

import { AUTHENTICATION_JWT_PORT_TOKEN } from '../../../authentication.constants';
import { Token } from '../../../domain/aggregates/token.aggregate';
import { JwtPolicy } from '../../../domain/policies/jwt.policy';
import { JwtPort } from '../../../domain/ports/jwt.port';
import { IssueAccessTokenCommand } from '../impl/issue-access-token.command';

@CommandHandler(IssueAccessTokenCommand)
export class IssueAccessTokenHandler
  implements ICommandHandler<IssueAccessTokenCommand, string>
{
  constructor(
    @Inject(AUTHENTICATION_JWT_PORT_TOKEN)
    private readonly jwtPort: JwtPort,
    @Inject(JwtPolicy)
    private readonly jwtPolicy: JwtPolicy,
    private readonly eventPublisher: EventPublisher,
  ) {}

  async execute(command: IssueAccessTokenCommand): Promise<string> {
    const { ctx, payload } = command;
    const now = new Date();

    const token = this.eventPublisher.mergeObjectContext(
      Token.create(new EventContextHost({}, {}), {
        sub: payload.sub,
        type: 'access',
        iat: now,
        exp: this.jwtPolicy.getAccessExpiry(now),
      }),
    );

    const signed = await this.jwtPort.signAccessToken(ctx, token);
    token.commit();
    return signed;
  }
}
