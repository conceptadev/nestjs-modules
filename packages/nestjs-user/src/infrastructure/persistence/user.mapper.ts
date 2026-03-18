import { UserEntityInterface, UserInterface } from '@concepta/nestjs-common';

import { DomainMapper } from '../../../../nestjs-common/dist/index-aggregate';
import { User } from '../../domain/aggregates/user';

export class UserMapper extends DomainMapper<
  UserEntityInterface,
  UserInterface,
  User
> {
  createAggregate(entity: UserEntityInterface): User {
    const { id, version, dateCreated, dateUpdated, dateDeleted, ...props } =
      entity;
    return new User(id, props, version, {
      dateCreated,
      dateUpdated,
      dateDeleted,
    });
  }
}
