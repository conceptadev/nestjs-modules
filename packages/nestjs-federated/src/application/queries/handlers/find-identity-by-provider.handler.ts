import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

import { Identity } from '../../../domain/aggregates/identity';
import { IdentityRepositoryInterface } from '../../../domain/repositories/identity-repository.interface';
import { FEDERATED_MODULE_IDENTITY_REPOSITORY_TOKEN } from '../../../federated.constants';
import { FindIdentityByProviderQuery } from '../impl/find-identity-by-provider.query';

@QueryHandler(FindIdentityByProviderQuery)
export class FindIdentityByProviderHandler implements IQueryHandler<FindIdentityByProviderQuery> {
  constructor(
    @Inject(FEDERATED_MODULE_IDENTITY_REPOSITORY_TOKEN)
    private readonly identityRepo: IdentityRepositoryInterface,
  ) {}

  async execute(query: FindIdentityByProviderQuery): Promise<Identity | null> {
    const { ctx, provider, subject } = query;
    return this.identityRepo.findByProviderAndSubject(ctx, provider, subject);
  }
}
