import { Injectable } from '@nestjs/common';

import {
  UserCredentialEntityInterface,
  UserEntityInterface,
} from '@concepta/nestjs-common';
import { getLocal } from '@concepta/nestjs-crud';
import { PlainLiteralObject } from '@nestjs/common';

import {
  BeforeFindOne,
  RepoHook,
  RepositoryFindOneOptions,
  RepoSpec,
  Where,
} from '@concepta/nestjs-repository';

import { AuthorizedUserLocalFixture } from './authorized-user.local.fixture';

@RepoHook()
@Injectable()
export class UserScopeHookFixture {
  @BeforeFindOne(RepoSpec.isEntity('user'))
  async scopeUserLookup(
    options: RepositoryFindOneOptions<UserEntityInterface>,
    ctx?: PlainLiteralObject,
  ): Promise<RepositoryFindOneOptions<UserEntityInterface>> {
    const authorizedUser = getLocal(ctx, AuthorizedUserLocalFixture);

    if (!authorizedUser?.id) {
      return options;
    }

    const condition = Where.eq('id', authorizedUser.id);

    return {
      ...options,
      where: options.where ? Where.and(options.where, condition) : condition,
    };
  }

  @BeforeFindOne(RepoSpec.isEntity('user-credentials'))
  async scopeCredentialsLookup(
    options: RepositoryFindOneOptions<UserCredentialEntityInterface>,
    ctx?: PlainLiteralObject,
  ): Promise<RepositoryFindOneOptions<UserCredentialEntityInterface>> {
    const authorizedUser = getLocal(ctx, AuthorizedUserLocalFixture);

    if (!authorizedUser?.id) {
      return options;
    }

    const userCondition = Where.eq('userId', authorizedUser.id);

    return {
      ...options,
      where: options.where
        ? Where.and(options.where, userCondition)
        : userCondition,
    };
  }
}
