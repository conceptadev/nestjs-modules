import { randomUUID } from 'crypto';

import {
  type DomainFactory,
  EventContextHost,
  UserCreatableInterface,
  UserInterface,
  UserUpdatableInterface,
} from '@concepta/nestjs-common';

import { DomainAggregate } from '../../../../nestjs-common/dist/index-aggregate';
import { UserCreatedEvent } from '../events/user-created.event';
import { UserRemovedEvent } from '../events/user-removed.event';
import { UserUpdatedEvent } from '../events/user-updated.event';

export class User extends DomainAggregate<UserInterface> {
  get email() {
    return this.props.email;
  }

  get username() {
    return this.props.username;
  }

  get active() {
    return this.props.active;
  }

  static create(
    eventContext: EventContextHost,
    props: UserCreatableInterface,
  ): User {
    return User.createWithId(eventContext, randomUUID(), props);
  }

  static createWithId(
    eventContext: EventContextHost,
    id: string,
    props: UserCreatableInterface,
  ): User {
    const user = new User(id, {
      email: props.email,
      username: props.username,
      active: props.active ?? true,
    });

    user.apply(new UserCreatedEvent(eventContext, user.toPlain()));

    return user;
  }

  update(
    eventContext: EventContextHost,
    dto: Partial<UserUpdatableInterface>,
  ): void {
    this.props = {
      ...this.props,
      ...dto,
    };
    this.incrementVersion();
    this.apply(new UserUpdatedEvent(eventContext, this.toPlain()));
  }

  remove(eventContext: EventContextHost): void {
    this.apply(new UserRemovedEvent(eventContext, this.toPlain()));
  }
}

User satisfies DomainFactory<UserCreatableInterface, User>;
