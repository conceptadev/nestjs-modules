import { Inject, Injectable } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';

import {
  EventContextHost,
  PasswordStorageInterface,
  ReferenceId,
  ReferenceIdInterface,
  RepositoryContextInterface,
} from '@concepta/nestjs-common';
import {
  PasswordCreationService,
  PasswordCreationServiceInterface,
  PasswordStorageService,
  PasswordStorageServiceInterface,
} from '@concepta/nestjs-password';
import { TransactionScope } from '@concepta/nestjs-repository';

import { USER_CREDENTIALS_REPOSITORY_TOKEN } from '../../user.constants';
import { UserCredentials } from '../aggregates/user-credentials';
import { UserCredentialsCollection } from '../collections/user-credentials.collection';
import { UserCredentialsAlreadyExistException } from '../exceptions/user-credentials-already-exist.exception';
import { UserPasswordCurrentInvalidException } from '../exceptions/user-password-current-invalid.exception';
import { UserPasswordPolicy } from '../policies/user-password.policy';
import { UserCredentialsRepositoryInterface } from '../repositories/user-credentials-repository.interface';

@Injectable()
export class UserCredentialsService {
  constructor(
    @Inject(USER_CREDENTIALS_REPOSITORY_TOKEN)
    private readonly userCredentialsRepository: UserCredentialsRepositoryInterface,
    private readonly txScope: TransactionScope,
    private readonly eventPublisher: EventPublisher,
    @Inject(PasswordCreationService)
    private readonly passwordCreationService: PasswordCreationServiceInterface,
    @Inject(PasswordStorageService)
    private readonly passwordStorageService: PasswordStorageServiceInterface,
    private readonly passwordPolicy: UserPasswordPolicy,
  ) {}

  async setPassword(
    ctx: RepositoryContextInterface,
    eventContext: EventContextHost,
    userId: ReferenceId,
    password: string,
  ): Promise<UserCredentials> {
    return this.txScope.run(ctx, async () => {
      const existing = await this.userCredentialsRepository.findActiveByUserId(
        ctx,
        userId,
      );

      if (existing) {
        throw new UserCredentialsAlreadyExistException();
      }

      const passwordStorage = await this.passwordStorageService.hash(password);
      return this.createCredentials(ctx, eventContext, userId, passwordStorage);
    });
  }

  async updatePassword(
    ctx: RepositoryContextInterface,
    eventContext: EventContextHost,
    userId: ReferenceId,
    password: string,
    passwordCurrent?: string,
  ): Promise<void> {
    await this.txScope.run(ctx, async () => {
      // fetch active credentials
      const activeCredentials =
        await this.userCredentialsRepository.findActiveByUserId(ctx, userId);

      // validate current password if required by policy
      if (this.passwordPolicy.requireCurrent) {
        if (!activeCredentials || !passwordCurrent) {
          throw new UserPasswordCurrentInvalidException();
        }

        await this.validateCurrentPassword(activeCredentials, passwordCurrent);
      }

      // validate against history
      await this.validateHistory(ctx, userId, password);

      // hash
      const passwordStorage = await this.passwordStorageService.hash(password);

      if (activeCredentials) {
        await this.deactivateCredentials(ctx, eventContext, activeCredentials);
      }

      await this.createCredentials(ctx, eventContext, userId, passwordStorage);
    });
  }

  protected async createCredentials(
    ctx: RepositoryContextInterface,
    eventContext: EventContextHost,
    userId: ReferenceId,
    passwordStorage: PasswordStorageInterface,
  ): Promise<UserCredentials> {
    return this.txScope.run(ctx, async (trx) => {
      const credentials = UserCredentials.create(eventContext, {
        userId,
        passwordHash: passwordStorage.passwordHash,
        passwordSalt: passwordStorage.passwordSalt,
      });

      const merged = this.eventPublisher.mergeObjectContext(credentials);
      await this.userCredentialsRepository.save(ctx, merged);
      trx.onCommit(ctx, () => merged.commit());
      trx.onRollback(ctx, () => merged.uncommit());

      return merged;
    });
  }

  protected async deactivateCredentials(
    ctx: RepositoryContextInterface,
    eventContext: EventContextHost,
    credentials: UserCredentials,
  ): Promise<void> {
    return this.txScope.run(ctx, async (trx) => {
      const merged = this.eventPublisher.mergeObjectContext(credentials);
      merged.deactivate(eventContext);
      await this.userCredentialsRepository.save(ctx, merged);
      trx.onCommit(ctx, () => merged.commit());
      trx.onRollback(ctx, () => merged.uncommit());
    });
  }

  protected async validateCurrentPassword(
    target: ReferenceIdInterface & PasswordStorageInterface,
    passwordCurrent: string,
  ): Promise<void> {
    const currentIsValid = await this.passwordCreationService.validateCurrent({
      password: passwordCurrent,
      target,
    });

    if (!currentIsValid) {
      throw new UserPasswordCurrentInvalidException();
    }
  }

  protected async validateHistory(
    ctx: RepositoryContextInterface,
    userId: ReferenceId,
    password: string,
  ): Promise<void> {
    if (!this.passwordPolicy.reuseRestricted) return;

    const history = await this.userCredentialsRepository.findByUserId(
      ctx,
      userId,
      this.passwordPolicy.reuseLimitDate,
    );

    const collection = new UserCredentialsCollection(
      history,
      this.passwordCreationService,
    );

    await collection.notReused(password);
  }
}
