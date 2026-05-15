import { Inject, Injectable, PlainLiteralObject } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';

import { EventContextHost, NotAnErrorException } from '@concepta/rockets-app';
import { TransactionScope } from '@concepta/rockets-repository';

import { FEDERATED_MODULE_IDENTITY_REPOSITORY_TOKEN } from '../../federated.constants';
import { FederatedCredentialsInterface } from '../../interfaces/federated-credentials.interface';
import { Identity } from '../aggregates/identity';
import { IdentityCreateUserException } from '../exceptions/identity-create-user.exception';
import { IdentityFindUserException } from '../exceptions/identity-find-user.exception';
import { IdentityUserRelationshipException } from '../exceptions/identity-user-relationship.exception';
import { FederatedUserPort } from '../ports/federated-user.port';
import { IdentityRepositoryInterface } from '../repositories/identity-repository.interface';

import { FederatedOAuthServiceInterface } from './federated-oauth-service.interface';

@Injectable()
export class FederatedOAuthService implements FederatedOAuthServiceInterface {
  constructor(
    @Inject(FEDERATED_MODULE_IDENTITY_REPOSITORY_TOKEN)
    private readonly identityRepo: IdentityRepositoryInterface,
    private readonly txScope: TransactionScope,
    private readonly eventPublisher: EventPublisher,
    private readonly userPort: FederatedUserPort,
  ) {}

  async sign(
    ctx: PlainLiteralObject,
    provider: string,
    email: string,
    subject: string,
  ): Promise<FederatedCredentialsInterface> {
    return this.txScope.run(ctx, async (txCtx) => {
      const existing = await this.identityRepo.findByProviderAndSubject(
        txCtx,
        provider,
        subject,
      );

      if (!existing) {
        return this.createUserWithIdentity(txCtx, provider, email, subject);
      }

      if (!existing.user?.id) {
        throw new IdentityUserRelationshipException(existing.id);
      }

      const user = await this.userPort.getById(txCtx, existing.user.id);

      if (!user) {
        throw new IdentityFindUserException(
          this.constructor.name,
          existing.user,
        );
      }

      return user;
    });
  }

  protected async createUserWithIdentity(
    ctx: PlainLiteralObject,
    provider: string,
    email: string,
    subject: string,
  ): Promise<FederatedCredentialsInterface> {
    return this.txScope.run(ctx, async (txCtx) => {
      const user = await this.findOrCreateUser(txCtx, email);

      const eventContext = new EventContextHost({}, {});
      const identity = this.eventPublisher.mergeObjectContext(
        Identity.create(eventContext, { provider, subject, user }),
      );

      await this.identityRepo.save(txCtx, identity);

      txCtx.trx.onCommit(() => identity.commit());
      txCtx.trx.onRollback(() => identity.uncommit());

      return user;
    });
  }

  private async findOrCreateUser(
    ctx: PlainLiteralObject,
    email: string,
  ): Promise<FederatedCredentialsInterface> {
    const existing = await this.userPort.getByEmail(ctx, email);

    if (existing) {
      return existing;
    }

    try {
      return await this.userPort.create(ctx, { email, username: email });
    } catch (e) {
      const exception = e instanceof Error ? e : new NotAnErrorException(e);
      throw new IdentityCreateUserException(this.constructor.name, {
        originalError: exception,
      });
    }
  }
}
