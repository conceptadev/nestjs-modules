# @concepta/nestjs-common

Core dependency for all Rockets modules. Provides the DDD aggregate
infrastructure, audit system, domain interfaces, context management,
and shared DTOs.

## Project

[![NPM Latest](https://img.shields.io/npm/v/@concepta/nestjs-common)](https://www.npmjs.com/package/@concepta/nestjs-common)
[![NPM Downloads](https://img.shields.io/npm/dw/@concepta/nestjs-common)](https://www.npmjs.com/package/@concepta/nestjs-common)
[![GH Last Commit](https://img.shields.io/github/last-commit/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets)
[![GH Contrib](https://img.shields.io/github/contributors/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets/graphs/contributors)
[![NestJS Dep](https://img.shields.io/github/package-json/dependency-version/conceptadev/rockets/@nestjs/common?label=NestJS&logo=nestjs&filename=packages%2Fnestjs-core%2Fpackage.json)](https://www.npmjs.com/package/@nestjs/common)

## Table of Contents

- [Installation](#installation)
- [Entry Points](#entry-points)
- [Domain Aggregates](#domain-aggregates)
- [Domain Mapper](#domain-mapper)
- [Domain Factory](#domain-factory)
- [Audit System](#audit-system)
- [Reference Interfaces](#reference-interfaces)
- [Context Management](#context-management)
- [DTOs](#dtos)
- [Domain Interfaces](#domain-interfaces)

## Installation

```sh
yarn add @concepta/nestjs-common
```

## Entry Points

| Path | Description |
| --- | --- |
| `@concepta/nestjs-common` | Main entry -- DTOs, interfaces, enums, utilities |
| `@concepta/nestjs-common/aggregate` | Aggregate infrastructure -- `DomainAggregate`, `DomainMapper`, `DomainAggregateDto`, `AggregateMetaInterface` |
| `@concepta/nestjs-common/testing` | `createMockEventPublisher`, `createMockCommandBus`, `createMockQueryBus` |

## Domain Aggregates

`DomainAggregate<T>` is the base class for all domain entities. It extends
`AggregateRoot` from `@nestjs/cqrs` and adds versioning, audit metadata,
and a `toPlain()` serialization method.

```ts
import { DomainAggregate, AggregateMetaInterface } from '@concepta/nestjs-common/aggregate';

export class Order extends DomainAggregate<OrderInterface> {
  constructor(
    id: string,
    props: OrderInterface,
    version?: number,
    meta?: AggregateMetaInterface,
  ) {
    super(id, props, version, meta);
  }

  get status() {
    return this.props.status;
  }

  cancel(eventContext): void {
    this.props = { ...this.props, status: 'cancelled' };
    this.incrementVersion();
    this.apply(new OrderCancelledEvent(eventContext, this.toPlain()));
  }
}
```

### Inherited API

| Member | Description |
| --- | --- |
| `id` | Immutable unique identifier |
| `version` | Optimistic concurrency version (starts at 1) |
| `meta` | `AggregateMetaInterface` -- `dateCreated`, `dateUpdated`, `dateDeleted` |
| `props` | Domain properties (protected, update via spread) |
| `stampCreated()` | Set creation timestamp |
| `stampUpdated()` | Set update timestamp |
| `stampDeleted()` | Mark as soft-deleted |
| `incrementVersion()` | Bump version (protected) |
| `toPlain()` | Returns `{ id, version, ...props, ...meta }` |

## Domain Mapper

`DomainMapper<Entity, Props, Aggregate>` bridges persistence entities and
domain aggregates. Concrete mappers implement `createAggregate()` and are
registered as NestJS providers, injected into repositories.

```ts
import { DomainMapper } from '@concepta/nestjs-common/aggregate';

export class OrderMapper extends DomainMapper<
  OrderEntityInterface,
  OrderInterface,
  Order
> {
  createAggregate(entity: OrderEntityInterface): Order {
    const { id, version, dateCreated, dateUpdated, dateDeleted, ...props } =
      entity;
    return new Order(id, props, version, {
      dateCreated,
      dateUpdated,
      dateDeleted,
    });
  }
}
```

| Method | Description |
| --- | --- |
| `createAggregate(entity)` | Abstract -- hydrate an aggregate from a persistence entity |
| `toDomain(entity)` | Calls `createAggregate()` |
| `toPersistence(aggregate)` | Calls `aggregate.toPlain()` |

## Domain Factory

`DomainFactory<Creatable, Domain>` constrains aggregate classes to expose
static `create()` and `createWithId()` factory methods with event context:

```ts
import { DomainFactory, EventContextInterface } from '@concepta/nestjs-common';

// Enforced via `satisfies` after the class declaration
Order satisfies DomainFactory<OrderCreatableInterface, Order>;
```

## Audit System

### AuditInterface

Combines three date interfaces for persistence tracking:

```ts
interface AuditInterface
  extends AuditDateCreatedInterface,
    AuditDateUpdatedInterface,
    AuditDateDeletedInterface {}
```

| Interface | Type |
| --- | --- |
| `AuditDateCreatedInterface` | `{ dateCreated: Date }` |
| `AuditDateUpdatedInterface` | `{ dateUpdated: Date }` |
| `AuditDateDeletedInterface` | `{ dateDeleted: Date \| null }` |

### AuditDto

DTO with `@Expose()` decorators for `dateCreated`, `dateUpdated`, and
`dateDeleted`. Used as a base class for entity DTOs.

### AggregateMetaInterface

Extends `AuditInterface`. Carried by `DomainAggregate` instances for
audit tracking.

## Reference Interfaces

Small, composable interfaces for common entity fields:

| Interface | Field |
| --- | --- |
| `ReferenceIdInterface` | `id: string` |
| `ReferenceVersionInterface` | `version: number` |
| `ReferenceEmailInterface` | `email: string` |
| `ReferenceUsernameInterface` | `username: string` |
| `ReferenceActiveInterface` | `active: boolean` |
| `ReferenceAssigneeInterface` | `assigneeId: string` |
| `ReferenceAssignmentInterface` | `assignment: string` |
| `ReferenceSubjectInterface` | `subject: string` |
| `ReferenceUserInterface` | `userId: string` |
| `ReferenceRoleInterface` | `role: string` |
| `ReferenceRolesInterface` | `roles: string[]` |

## Context Management

| Export | Description |
| --- | --- |
| `AppContextHost` | Per-request context container with `register()` for read-only properties and `defineOverlay()` for lazy overlay methods |
| `getAppContext()` | Retrieves the current app context from a request |
| `@Ctx()` | Parameter decorator for injecting context |
| `ContextOverlayInterface` | Interface for defining lazy context overlays (e.g. `withCache`, `withRole`) |
| `EventContextHost` | Creates event context with entity headers |
| `AppContextInterface` | App context shape |
| `HookContextInterface` | Hook context shape |
| `EventContextInterface` | Event context shape |

## DTOs

| DTO | Extends | Adds |
| --- | --- | --- |
| `AuditDto` | -- | `dateCreated`, `dateUpdated`, `dateDeleted` |
| `CommonEntityDto` | `AuditDto` | `id` |
| `DomainAggregateDto` | `AuditDto` | `id`, `version` |
| `ReferenceIdDto` | -- | `id` |

`DomainAggregateDto` is the standard base for API response DTOs when using
domain aggregates.

## Domain Interfaces

The module exports domain interfaces for all Rockets feature modules. These
define the cross-module contracts that entity interfaces, DTOs, and aggregates
implement.

| Domain | Key Interfaces |
| --- | --- |
| User | `UserInterface`, `UserCreatableInterface`, `UserEntityInterface` |
| User Credentials | `UserCredentialInterface`, `UserCredentialEntityInterface` |
| Role | `RoleInterface`, `RoleCreatableInterface`, `RoleEntityInterface` |
| Role Assignment | `RoleAssignmentInterface`, `RoleAssignmentEntityInterface` |
| Cache | `CacheInterface`, `CacheCreatableInterface`, `CacheEntityInterface` |
| OTP | `OtpInterface`, `OtpCreatableInterface`, `OtpEntityInterface` |
| Invitation | `InvitationUserInterface` |
| Auth | `AuthenticationAccessInterface`, `AuthorizationPayloadInterface` |
