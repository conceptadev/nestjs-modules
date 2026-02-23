import { randomUUID } from 'crypto';

import { AggregateRoot } from '@nestjs/cqrs';

import {
  CacheCreatableInterface,
  CacheInterface,
  DomainFactory,
  DomainMappable,
  EntityHeaderInterface,
  EventContextHost,
} from '@concepta/nestjs-common';

import { CacheSettingsInterface } from '../../infrastructure/config/interfaces/cache-settings.interface';
import { CacheCreatedEvent } from '../events/cache-created.event';
import { CacheExtendedEvent } from '../events/cache-extended.event';
import { CacheReplacedEvent } from '../events/cache-replaced.event';
import { CacheUpdatedEvent } from '../events/cache-updated.event';
import { getExpirationDate } from '../utils/get-expiration-date.util';

export class Cache
  extends AggregateRoot
  implements CacheInterface, DomainMappable<CacheInterface>
{
  private props: CacheInterface;

  private settings?: CacheSettingsInterface;

  constructor(entity: CacheInterface, settings?: CacheSettingsInterface) {
    super();
    this.props = { ...entity };
    this.settings = settings;
  }

  get id() {
    return this.props.id;
  }
  get key() {
    return this.props.key;
  }
  get type() {
    return this.props.type;
  }
  get assigneeId() {
    return this.props.assigneeId;
  }
  get data() {
    return this.props.data;
  }
  get expirationDate() {
    return this.props.expirationDate;
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
    dto: CacheCreatableInterface,
    settings: CacheSettingsInterface,
  ): Cache {
    return Cache.createWithId(eventContext, randomUUID(), dto, settings);
  }

  static createWithId(
    eventContext: EventContextHost<EntityHeaderInterface>,
    id: string,
    dto: CacheCreatableInterface,
    settings: CacheSettingsInterface,
  ): Cache {
    const { key, type, assigneeId, data, expiresIn } = dto;
    const now = new Date();

    const cache = new Cache(
      {
        id,
        key,
        type,
        assigneeId,
        data,
        expirationDate: getExpirationDate(expiresIn ?? settings.expiresIn),
        dateCreated: now,
        dateUpdated: now,
        dateDeleted: null,
        version: 1,
      },
      settings,
    );

    cache.apply(new CacheCreatedEvent(eventContext, cache.toPlain()));

    return cache;
  }

  static toInstance(
    entity: CacheInterface,
    settings?: CacheSettingsInterface,
  ): Cache {
    return new Cache(entity, settings);
  }

  toPlain(): CacheInterface {
    return { ...this.props };
  }

  hydrate(entity: CacheInterface): void {
    this.props = { ...entity };
  }

  replace(
    eventContext: EventContextHost<EntityHeaderInterface>,
    dto: CacheCreatableInterface,
  ): void {
    const { key, type, assigneeId, data, expiresIn } = dto;
    this.props = {
      id: this.props.id,
      key,
      type,
      assigneeId,
      data,
      expirationDate: this.resolveExpirationDate(expiresIn),
      dateCreated: this.props.dateCreated,
      dateUpdated: new Date(),
      dateDeleted: this.props.dateDeleted,
      version: this.props.version + 1,
    };
    this.apply(new CacheReplacedEvent(eventContext, this.toPlain()));
  }

  updateData(
    eventContext: EventContextHost<EntityHeaderInterface>,
    newData: string | null,
  ): void {
    this.props = {
      ...this.props,
      data: newData,
      dateUpdated: new Date(),
      version: this.props.version + 1,
    };
    this.apply(new CacheUpdatedEvent(eventContext, this.toPlain()));
  }

  extend(
    eventContext: EventContextHost<EntityHeaderInterface>,
    expiresIn?: string,
  ): void {
    this.props = {
      ...this.props,
      expirationDate: this.resolveExpirationDate(expiresIn),
      dateUpdated: new Date(),
      version: this.props.version + 1,
    };
    this.apply(new CacheExtendedEvent(eventContext, this.toPlain()));
  }

  private resolveExpirationDate(expiresIn?: string | null): Date | null {
    return getExpirationDate(expiresIn ?? this.settings?.expiresIn);
  }
}

Cache satisfies DomainFactory<CacheInterface, CacheCreatableInterface, Cache>;
