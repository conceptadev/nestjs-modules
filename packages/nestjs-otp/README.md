# @concepta/nestjs-otp

OTP management module for NestJS using DDD/CQRS. Provides one-time passcode
generation, validation, and consumption with rate limiting, configurable
duplicate strategies, and automatic history cleanup.

## Project

[![NPM Latest](https://img.shields.io/npm/v/@concepta/nestjs-otp)](https://www.npmjs.com/package/@concepta/nestjs-otp)
[![NPM Downloads](https://img.shields.io/npm/dw/@concepta/nestjs-otp)](https://www.npmjs.com/package/@concepta/nestjs-otp)
[![GH Last Commit](https://img.shields.io/github/last-commit/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets)
[![GH Contrib](https://img.shields.io/github/contributors/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets/graphs/contributors)
[![NestJS Dep](https://img.shields.io/github/package-json/dependency-version/conceptadev/rockets/@nestjs/common?label=NestJS&logo=nestjs&filename=packages%2Fnestjs-core%2Fpackage.json)](https://www.npmjs.com/package/@nestjs/common)

## Table of Contents

- [Installation](#installation)
- [Module Registration](#module-registration)
- [Architecture Overview](#architecture-overview)
- [App Context](#app-context)
- [Commands](#commands)
- [Queries](#queries)
- [Domain Events](#domain-events)
- [Otp Aggregate](#otp-aggregate)
- [Repository](#repository)
- [DTOs](#dtos)
- [Exceptions](#exceptions)
- [HTTP Controller with CRUD Module](#http-controller-with-crud-module)
- [Environment Variables](#environment-variables)

## Installation

```sh
yarn add @concepta/nestjs-otp
```

### Dependencies

`@nestjs/cqrs` is a direct dependency (used for `CommandBus`, `QueryBus`,
`EventBus`).

### Peer Dependencies

| Package | Required | Notes |
| --- | --- | --- |
| `class-transformer` | Yes | DTO serialization |
| `class-validator` | Yes | DTO validation |
| `typeorm` | No | Only if using the TypeORM repository adapter |
| `@concepta/nestjs-crud` | No | Only if using the HTTP gateway layer |
| `@concepta/typeorm-seeding` | No | Only for database seeding |
| `@faker-js/faker` | No | Only for database seeding |

## Module Registration

### Synchronous

```ts
import { OtpModule } from '@concepta/nestjs-otp';

@Module({
  imports: [
    OtpModule.register({
      settings: {
        types: {
          uuid: { generator: uuidGenerator, validator: uuidValidator },
        },
        duplicateStrategy: 'DEACTIVATE',
      },
    }),
  ],
})
export class AppModule {}
```

### Asynchronous

```ts
@Module({
  imports: [
    OtpModule.registerAsync({
      useFactory: async () => ({
        settings: {
          types: {
            uuid: { generator: uuidGenerator, validator: uuidValidator },
          },
          duplicateStrategy: 'DEACTIVATE',
        },
      }),
    }),
  ],
})
export class AppModule {}
```

`register()` / `registerAsync()` register the module **locally** (scoped to
the importing module).

`forRoot()` / `forRootAsync()` register the module **globally**. This is
required when using `forFeature()` in other modules, since `forFeature()`
injects tokens exported by the core module.

### forFeature

Use `forFeature()` to register dynamic `OtpRepository` providers for each
entity key.

```ts
@Module({
  imports: [
    OtpModule.forFeature(['userOtp', 'emailOtp']),
  ],
})
export class UserModule {}
```

Each entity key maps to an `OtpRepository` instance resolved at runtime by
`OtpRepositoryResolver`.

### Options

`forRoot()` and `registerAsync()` accept `OtpOptionsInterface` merged with
`OtpExtrasInterface` (extras are passed to `setExtras` on the
`ConfigurableModuleBuilder`):

```ts
interface OtpExtrasInterface {
  global?: boolean;
  providers?: Provider[];
  repositories?: {
    otp?: Type<OtpRepositoryInterface>;
  };
}

interface OtpOptionsInterface {
  settings?: OtpSettingsInterface;
}

interface OtpSettingsInterface {
  types: Record<string, OtpTypeServiceInterface>;
  duplicateStrategy: 'ALLOW' | 'DEACTIVATE';
  keepHistoryDays?: number;
  rateSeconds?: number;
  rateThreshold?: number;
}
```

`forFeature()` accepts an array of entity key strings. Each key creates a
dynamic `OtpRepository` provider:

```ts
OtpModule.forFeature(entityKeys: string[])
```

- **`types`** -- map of OTP type strategies. Each type provides a `generator()`
  that returns a new passcode and a `validator(a, b)` that checks equality.
  The default `uuid` type uses `crypto.randomUUID()`.
- **`duplicateStrategy`** -- `'DEACTIVATE'` deactivates existing active OTPs
  for the same assignee and category before creating a new one. `'ALLOW'`
  permits multiple active OTPs simultaneously.
- **`keepHistoryDays`** -- when set, consumed/deactivated OTPs are retained for
  N days then cleaned up automatically. When unset, OTPs are hard-deleted
  immediately.
- **`rateSeconds`** / **`rateThreshold`** -- rate limiting window (in seconds)
  and maximum creation attempts within that window. Exceeding the threshold
  throws `OtpLimitReachedException`.

Pass `repositories.otp` to override the default `OtpRepository` with a
custom implementation.

## Architecture Overview

The module follows a DDD/CQRS architecture:

```text
Application (Commands / Queries / Listeners)
  |
Domain (Otp aggregate, Events, Services)
  |
Infrastructure (Repository, Mapper, DTOs, Config)
```

- **Domain** -- `Otp` aggregate extending `DomainAggregate<OtpInterface>`,
  3 domain events, history cleanup service
- **Application** -- 6 commands and 4 queries dispatched via `@nestjs/cqrs`,
  1 built-in event listener
- **Infrastructure** -- `OtpRepository` with ctx-first signatures,
  `OtpMapper` for entity-to-aggregate conversion (DI-injected),
  `OtpRepositoryResolver`, DTOs, config

The module does not include a gateway layer. See
[HTTP Controller with CRUD Module](#http-controller-with-crud-module) for how
to expose OTP operations as REST endpoints.

## App Context

Commands, queries, and repository methods require a `RepositoryContextInterface`
as their first argument. This context carries the entity key, transaction state,
and hook configuration for the operation.

Use `AppContextHost.merge()` to create a context:

```ts
import { AppContextHost, RepositoryContextInterface } from '@concepta/nestjs-common';

const ctx = AppContextHost.merge<RepositoryContextInterface>(() => ({
  entity: 'userOtp',
}));
```

The `entity` value must match a key registered via `OtpModule.forFeature()`.

When an existing context is available (e.g. from a transaction scope), pass it
as the second argument to inherit its properties:

```ts
const childCtx = AppContextHost.merge<RepositoryContextInterface>(
  () => ({ entity: 'emailOtp' }),
  parentCtx,
);
```

The factory receives a `has` function to conditionally set properties only when
they are not already present on the parent context:

```ts
const ctx = AppContextHost.merge<RepositoryContextInterface>((has) => ({
  entity: 'userOtp',
  ...(!has('trx') && { trx: myTransactionManager }),
}), parentCtx);
```

## Commands

| Command | Description |
| --- | --- |
| `CreateOtpCommand` | Create a new OTP (with rate limiting and duplicate strategy) |
| `ConsumeOtpCommand` | Validate and consume an active OTP by category and passcode |
| `DeactivateOtpCommand` | Deactivate the active OTP for an assignee and category |
| `RemoveOtpCommand` | Hard delete an OTP by assignee, category, and passcode |
| `ClearOtpsCommand` | Remove all OTPs for an assignee and category |
| `ClearOtpHistoryCommand` | Clean up old OTP history by retention days |

### Dispatching a Command

```ts
import { CommandBus } from '@nestjs/cqrs';
import { CreateOtpCommand, Otp } from '@concepta/nestjs-otp';

const otp = await this.commandBus.execute<CreateOtpCommand, Otp>(
  new CreateOtpCommand(ctx, {
    category: 'email-verification',
    type: 'uuid',
    expiresIn: '15m',
    assigneeId: userId,
  }),
);
```

`CreateOtpCommand` accepts an optional third argument for per-request overrides:

```ts
new CreateOtpCommand(ctx, dto, {
  duplicateStrategy: 'ALLOW',
  rateSeconds: 60,
  rateThreshold: 3,
});
```

## Queries

| Query | Description |
| --- | --- |
| `GetOtpQuery` | Get by ID (throws `OtpNotFoundException`) |
| `FindActiveOtpQuery` | Find active OTP by category and passcode (returns null) |
| `FindAssignedOtpsQuery` | Find all OTPs for an assignee and category |
| `ValidateOtpQuery` | Validate passcode without consuming (returns assignee or null) |

### Dispatching a Query

```ts
import { QueryBus } from '@nestjs/cqrs';
import { ValidateOtpQuery } from '@concepta/nestjs-otp';
import { AssigneeRelationInterface } from '@concepta/nestjs-common';

const result = await this.queryBus.execute<
  ValidateOtpQuery,
  AssigneeRelationInterface | null
>(new ValidateOtpQuery(ctx, { category: 'email-verification', passcode }));
```

## Domain Events

All events carry an `eventContext` and a plain `OtpInterface` snapshot.

| Event | Emitted When |
| --- | --- |
| `OtpCreatedEvent` | New OTP created |
| `OtpConsumedEvent` | OTP consumed/used |
| `OtpDeactivatedEvent` | OTP deactivated |

### Handling an Event

```ts
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { OtpCreatedEvent } from '@concepta/nestjs-otp';

@EventsHandler(OtpCreatedEvent)
export class OtpCreatedListener implements IEventHandler<OtpCreatedEvent> {
  handle(event: OtpCreatedEvent): void {
    const { eventContext, otp } = event;
    // react to OTP creation
  }
}
```

`OtpHistoryCleanupListener` is a built-in listener that reacts to
`OtpCreatedEvent` and automatically cleans up old history when
`keepHistoryDays` is configured.

## Otp Aggregate

The `Otp` class extends `DomainAggregate<OtpInterface>` and encapsulates all
OTP domain logic.

### Factory Methods

```ts
// Create with auto-generated UUID
const otp = Otp.create(eventContext, {
  category: 'email-verification',
  type: 'uuid',
  assigneeId: userId,
  passcode,
  expirationDate,
});

// Create with a specific ID
const otp = Otp.createWithId(eventContext, id, props);
```

Reconstitution from a database entity is handled by `OtpMapper` (see
[Repository](#repository)).

### Operations

```ts
// Deactivate the OTP (sets active to false)
otp.deactivate(eventContext);

// Mark OTP as consumed
otp.consume(eventContext);

// Check if the OTP has expired
otp.isExpired();

// Convert to plain OtpInterface object (inherited from DomainAggregate)
const plain = otp.toPlain();
```

## Repository

`OtpRepository` uses a ctx-first calling convention. All methods take
`RepositoryContextInterface` as the first argument.

The repository receives a DI-injected `OtpMapper` that converts database
entities to `Otp` aggregates via `toDomain()` and aggregates back to
persistence form via `toPersistence()`.

| Method | Signature |
| --- | --- |
| `get` | `(ctx, id) => Promise<Otp>` |
| `findActiveByPasscode` | `(ctx, { category, passcode }) => Promise<Otp \| null>` |
| `findByPasscode` | `(ctx, { category, passcode }) => Promise<Otp \| null>` |
| `findActiveByAssignee` | `(ctx, { assigneeId, category }) => Promise<Otp \| null>` |
| `findAllByAssigneeAndCategory` | `(ctx, { assigneeId, category }) => Promise<Otp[]>` |
| `countCreatedSince` | `(ctx, { assigneeId, category, since }) => Promise<number>` |
| `findOlderThan` | `(ctx, { assigneeId, category, cutoff }) => Promise<Otp[]>` |
| `save` | `(ctx, otp) => Promise<void>` |
| `remove` | `(ctx, otp) => Promise<void>` |
| `removeAll` | `(ctx, otps) => Promise<void>` |

### Repository Resolution

```ts
const otpRepo = this.repositoryResolver.resolve('userOtp');
const otp = await otpRepo.get(ctx, id);
```

`OtpRepositoryResolver` looks up the repository by entity key. Entity keys
are registered via `OtpModule.forFeature()`.

## DTOs

| DTO | Fields |
| --- | --- |
| `OtpCreateDto` | category, type, expiresIn, assigneeId, rateSeconds?, rateThreshold? |

The `expiresIn` field accepts time span strings: `'60'`, `'2 days'`, `'10h'`,
`'7d'`.

## Exceptions

| Exception | Description |
| --- | --- |
| `OtpNotFoundException` | OTP ID not found (HTTP 404) |
| `OtpEntityNotFoundException` | Entity key not registered via `forFeature()` |
| `OtpTypeNotDefinedException` | OTP type not configured in settings |
| `OtpLimitReachedException` | Rate limit exceeded (HTTP 429) |
| `OtpInvalidExpirationDateException` | Invalid `expiresIn` format |
| `OtpException` | Base OTP exception |

## HTTP Controller with CRUD Module

The OTP module does not include a gateway layer. To expose OTP operations as
REST endpoints via `@concepta/nestjs-crud`, create custom request and handler
classes that bridge CRUD operations to domain commands.

### Custom Request Class

Extend a CRUD command to define the request type:

```ts
import { OtpCreatableInterface, OtpInterface } from '@concepta/nestjs-common';
import { CrudCreateCommand } from '@concepta/nestjs-crud';

export class CreateOtpRequest extends CrudCreateCommand<
  OtpInterface,
  OtpCreatableInterface
> {}
```

### Custom Request Handler

The handler receives the CRUD command and dispatches the domain command:

```ts
import { Injectable } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { OtpCreatableInterface, OtpInterface } from '@concepta/nestjs-common';
import { CrudCreateCommand } from '@concepta/nestjs-crud';
import { CreateOtpCommand, Otp } from '@concepta/nestjs-otp';

@Injectable()
export class CreateOtpRequestHandler {
  constructor(private readonly commandBus: CommandBus) {}

  async execute(
    command: CrudCreateCommand<OtpInterface, OtpCreatableInterface>,
  ): Promise<OtpInterface> {
    const { context, dto } = command;
    const otp = await this.commandBus.execute<CreateOtpCommand, Otp>(
      new CreateOtpCommand(context, dto),
    );
    return otp.toPlain();
  }
}
```

### Module Wiring

```ts
import { Module } from '@nestjs/common';
import { OtpInterface, Operation } from '@concepta/nestjs-common';
import { CrudCqrsResolver, CrudModule } from '@concepta/nestjs-crud';
import { OtpModule, OtpCreateDto } from '@concepta/nestjs-otp';

import { CreateOtpRequest } from './create-otp.request';
import { CreateOtpRequestHandler } from './create-otp-request.handler';

@Module({
  imports: [
    OtpModule.forFeature(['userOtp']),
    CrudModule.forFeature<OtpInterface>({
      crud: {
        controller: {
          entity: 'userOtp',
          path: 'otp/user',
          resolver: CrudCqrsResolver,
          transactional: true,
          request: { body: OtpCreateDto },
          response: { resource: OtpCreateDto },
        },
        operations: [
          {
            operation: Operation.Create,
            request: { body: OtpCreateDto },
            command: CreateOtpRequest,
            commandHandler: CreateOtpRequestHandler,
          },
        ],
      },
    }),
  ],
})
export class UserOtpModule {}
```

This is a minimal example showing a single Create operation. Add more
operations (Read, List, Delete, etc.) by creating additional request/handler
pairs following the same pattern. See the `@concepta/nestjs-crud` documentation
for the full API.

`OtpModule.forRoot()` (or `forRootAsync()`) must be registered globally
in a parent module for `forFeature()` to resolve its dependencies.

## Environment Variables

| Variable | Default | Description |
| --- | --- | --- |
| `OTP_DUPLICATE_STRATEGY` | `DEACTIVATE` | `'DEACTIVATE'` or `'ALLOW'` |
| `OTP_KEEP_HISTORY_DAYS` | `null` | Days to retain OTP history |
| `OTP_RATE_SECONDS` | `null` | Rate limit window in seconds |
| `OTP_RATE_THRESHOLD` | `null` | Max creation attempts in rate window |
