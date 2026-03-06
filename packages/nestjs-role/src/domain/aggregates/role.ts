import { randomUUID } from 'crypto';

import { AggregateRoot } from '@nestjs/cqrs';

import {
  type DomainFactory,
  DomainMappable,
  EntityHeaderInterface,
  EventContextHost,
  RoleEntityInterface,
} from '@concepta/nestjs-common';

import { RoleCreatedEvent } from '../events/role-created.event';
import { RoleReplacedEvent } from '../events/role-replaced.event';
import { RoleUpdatedEvent } from '../events/role-updated.event';

export interface RoleCreateProps {
  name: string;
  description: string;
}

export class Role
  extends AggregateRoot
  implements RoleEntityInterface, DomainMappable<RoleEntityInterface>
{
  private props: RoleEntityInterface;

  constructor(entity: RoleEntityInterface) {
    super();
    this.props = { ...entity };
  }

  get id() {
    return this.props.id;
  }

  get name() {
    return this.props.name;
  }

  get description() {
    return this.props.description;
  }

  get dateCreated() {
    return this.props.dateCreated;
  }

  get dateUpdated() {
    return this.props.dateUpdated;
  }

  get dateDeleted() {
    return this.props.dateDeleted;
  }

  get version() {
    return this.props.version;
  }

  static create(
    eventContext: EventContextHost<EntityHeaderInterface>,
    props: RoleCreateProps,
  ): Role {
    return Role.createWithId(eventContext, randomUUID(), props);
  }

  static createWithId(
    eventContext: EventContextHost<EntityHeaderInterface>,
    id: string,
    props: RoleCreateProps,
  ): Role {
    const { name, description } = props;
    const now = new Date();

    const role = new Role({
      id,
      name,
      description,
      dateCreated: now,
      dateUpdated: now,
      dateDeleted: null,
      version: 1,
    });

    role.apply(new RoleCreatedEvent(eventContext, role.toPlain()));

    return role;
  }

  static toInstance(entity: RoleEntityInterface): Role {
    return new Role(entity);
  }

  toPlain(): RoleEntityInterface {
    return { ...this.props };
  }

  hydrate(entity: RoleEntityInterface): void {
    this.props = { ...entity };
  }

  update(
    eventContext: EventContextHost<EntityHeaderInterface>,
    dto: Partial<RoleCreateProps>,
  ): void {
    this.props = {
      ...this.props,
      ...dto,
      dateUpdated: new Date(),
      version: this.props.version + 1,
    };
    this.apply(new RoleUpdatedEvent(eventContext, this.toPlain()));
  }

  replace(
    eventContext: EventContextHost<EntityHeaderInterface>,
    dto: RoleCreateProps,
  ): void {
    this.props = {
      ...this.props,
      name: dto.name,
      description: dto.description,
      dateUpdated: new Date(),
      version: this.props.version + 1,
    };
    this.apply(new RoleReplacedEvent(eventContext, this.toPlain()));
  }
}

Role satisfies DomainFactory<RoleEntityInterface, RoleCreateProps, Role>;
