import {
  UserCredentialEntityInterface,
  UserCredentialInterface,
} from '@concepta/nestjs-common';
import { DomainMapper } from '@concepta/nestjs-common/aggregate';

import { UserCredentials } from '../../domain/aggregates/user-credentials';

export class UserCredentialsMapper extends DomainMapper<
  UserCredentialEntityInterface,
  UserCredentialInterface,
  UserCredentials
> {
  createAggregate(entity: UserCredentialEntityInterface): UserCredentials {
    const { id, version, dateCreated, dateUpdated, dateDeleted, ...props } =
      entity;
    return new UserCredentials(id, props, version, {
      dateCreated,
      dateUpdated,
      dateDeleted,
    });
  }
}
