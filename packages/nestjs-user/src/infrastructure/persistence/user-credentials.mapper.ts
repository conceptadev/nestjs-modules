import { DomainMapper } from '@concepta/rockets-app/aggregate';

import { UserCredentials } from '../../domain/aggregates/user-credentials';
import { UserCredentialEntityInterface } from '../../domain/interfaces/user-credential-entity.interface';
import { UserCredentialInterface } from '../../domain/interfaces/user-credential.interface';

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
