import { DomainMapper } from '@concepta/rockets-app/aggregate';

import { User } from '../../domain/aggregates/user';
import { UserEntityInterface } from '../../domain/interfaces/user-entity.interface';
import { UserInterface } from '../../domain/interfaces/user.interface';

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
