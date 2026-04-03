# Rockets NestJS Invitation

Invite users by email with OTP-based acceptance, automatic email delivery, and
event-driven lifecycle management.

## Project

[![NPM Latest](https://img.shields.io/npm/v/@concepta/nestjs-invitation)](https://www.npmjs.com/package/@concepta/nestjs-invitation)
[![NPM Downloads](https://img.shields.io/npm/dw/@conceptadev/nestjs-invitation)](https://www.npmjs.com/package/@concepta/nestjs-invitation)
[![GH Last Commit](https://img.shields.io/github/last-commit/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets)
[![GH Contrib](https://img.shields.io/github/contributors/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets/graphs/contributors)
[![NestJS Dep](https://img.shields.io/github/package-json/dependency-version/conceptadev/rockets/@nestjs/common?label=NestJS&logo=nestjs&filename=packages%2Fnestjs-core%2Fpackage.json)](https://www.npmjs.com/package/@nestjs/common)

## Table of Contents

- [Provided Features](#provided-features)
- [Installation](#installation)
- [Module Registration](#module-registration)
- [Architecture Overview](#architecture-overview)
- [Aggregate](#aggregate)
- [Ports](#ports)
- [Policies](#policies)
- [Commands](#commands)
- [Queries](#queries)
- [Domain Events](#domain-events)
- [DTOs](#dtos)
- [Exceptions](#exceptions)
- [HTTP Gateway](#http-gateway)
- [Entry Points](#entry-points)
- [Seeding](#seeding)
- [Default Configuration](#default-configuration)

## Provided Features

### Invitation Lifecycle
- Create invitation by user ID (with explicit code)
- Create invitation by email address (auto-generates code, resolves user)
- Send/resend invitation email (with OTP passcode generation)
- Accept invitation (OTP validation + payload for downstream listeners)
- Revoke all invitations for a user+category
- Remove (hard delete) an invitation

### OTP Integration
- Auto-create OTP on invitation send
- Consume OTP on acceptance (single-use)
- Clear all OTPs for a user+category on revocation
- Configurable OTP type (uuid, numeric, etc.)
- Configurable expiration duration
- Optional clear-on-create behavior
- Optional rate limiting (rateSeconds + rateThreshold)

### Email Delivery
- Send invitation email with passcode and expiration
- Send acceptance confirmation email
- Handlebars template support with configurable templates
- Configurable sender address and base URL

### User Resolution
- Look up user by ID
- Look up user by email address

### Event-Driven Architecture
- `InvitationCreatedEvent` -- fired on creation
- `InvitationDispatchedEvent` -- fired when email should be sent (carries OTP metadata)
- `InvitationAcceptedEvent` -- fired on acceptance (carries optional payload for downstream listeners)
- `InvitationRevokedEvent` -- fired on revocation
- `InvitationRemovedEvent` -- fired on deletion
- Auto-send email on dispatch via `InvitationDispatchedListener`
- Auto-send acceptance confirmation via `InvitationAcceptedListener`
- Auto-clear OTPs on revocation via `InvitationRevokedListener`

### Auto-Revocation
- On acceptance: automatically revoke all sibling invitations (same user+category)
- On revocation: automatically clear associated OTPs

### HTTP Gateway
- Create invitation endpoint (by user ID)
- Create invitation endpoint (by email)
- Send/resend invitation endpoint
- Accept invitation endpoint
- Delete invitation endpoint
- List invitations (paginated)
- Read single invitation

### Repository
- Get invitation by ID
- Find invitation by code
- Find all invitations by user+category
- Save (insert/update)
- Remove single invitation
- Batch remove invitations
- Domain-to-persistence mapping via `InvitationMapper`

### Seeding
- `InvitationFactory` for generating test invitation entities

### Configurable Settings
- Email: sender address, base URL, invitation template, accepted template
- OTP: namespace, type, expiration, clear-on-create, rate limiting

---

## Installation

```sh
yarn add @concepta/nestjs-invitation
```

### Peer Dependencies

| Package | Required | Notes |
| --- | --- | --- |
| `class-transformer` | Yes | DTO serialization |
| `class-validator` | Yes | DTO validation |
| `rxjs` | Yes | NestJS requirement |
| `typeorm` | No | Only if using the TypeORM repository adapter |
| `@concepta/nestjs-repository-typeorm` | No | Only if using the TypeORM repository adapter |

## Module Registration

### Synchronous

```ts
import { InvitationModule } from '@concepta/nestjs-invitation';

@Module({
  imports: [
    InvitationModule.register({
      settings: {
        email: {
          from: 'invitations@example.com',
          baseUrl: 'https://app.example.com',
        },
        otp: {
          namespace: 'user-otp',
          type: 'uuid',
          expiresIn: '24h',
        },
      },
      ports: {
        otp: { /* InvitationOtpPortSettings */ },
        user: { /* InvitationUserPortSettings */ },
        email: { /* InvitationEmailPortSettings */ },
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
    InvitationModule.registerAsync({
      useFactory: async () => ({
        settings: { /* ... */ },
        ports: { /* ... */ },
      }),
    }),
  ],
})
export class AppModule {}
```

`register()` / `registerAsync()` register the module **locally** (scoped to
the importing module).

`forRoot()` / `forRootAsync()` register the module **globally**.

### Options

```ts
interface InvitationOptionsInterface extends ModuleOptionsControllerInterface {
  settings?: InvitationSettingsInterface;
  ports: InvitationPortsInterface;
}

interface InvitationPortsInterface {
  otp: InvitationOtpPortSettings;
  user: InvitationUserPortSettings;
  email: InvitationEmailPortSettings;
}

interface InvitationSettingsInterface {
  email: InvitationEmailSettings;
  otp: InvitationOtpSettingsInterface;
}
```

## Architecture Overview

The module follows a DDD/CQRS architecture:

```text
Gateways (HTTP request/response handlers)
  |
Application (Commands / Queries / Listeners)
  |
Domain (Invitation aggregate, Events, Ports, Policies)
  |
Infrastructure (Repository, Mapper, DTOs, Config)
```

| Layer | Directory | Responsibility |
| --- | --- | --- |
| Domain | `domain/` | Aggregate, events, ports, policies, repository interface |
| Application | `application/` | Command/query handlers, event listeners, exceptions |
| Infrastructure | `infrastructure/` | DTOs, persistence (repository, mapper, entities), config |
| Gateways | `gateways/` | HTTP request handlers (REST endpoints) |

## Aggregate

The `Invitation` class extends `DomainAggregate<InvitationInterface>` and
encapsulates all invitation domain logic.

### Factory Methods

```ts
// Create with auto-generated UUID
const invitation = Invitation.create(eventContext, {
  code: 'abc-123',
  category: 'onboarding',
  userId: 'user-1',
  constraints: { role: 'editor' },
});

// Create with a specific ID
const invitation = Invitation.createWithId(eventContext, id, dto);
```

### Operations

```ts
// Dispatch invitation (fires InvitationDispatchedEvent)
invitation.dispatch(eventContext);

// Accept invitation (fires InvitationAcceptedEvent)
invitation.accept(eventContext, payload);

// Revoke invitation (fires InvitationRevokedEvent)
invitation.revoke(eventContext);

// Remove invitation (fires InvitationRemovedEvent)
invitation.remove(eventContext);

// Convert to plain object
const plain = invitation.toPlain();
```

### Properties

| Property | Type | Description |
| --- | --- | --- |
| `code` | `string` | Unique invitation code |
| `category` | `string` | Invitation category |
| `userId` | `ReferenceId` | Invited user ID |
| `constraints` | `LiteralObject \| undefined` | Optional constraints |
| `dateAccepted` | `Date \| null` | Acceptance timestamp |
| `dateRevoked` | `Date \| null` | Revocation timestamp |
| `active` | `boolean` | `true` if not accepted and not revoked |
| `isAccepted` | `boolean` | `true` if accepted |
| `isRevoked` | `boolean` | `true` if revoked |

## Ports

External integrations are abstracted via three ports. Each port dispatches
commands/queries through the NestJS CQRS bus.

### InvitationOtpPort

Settings:
```ts
interface InvitationOtpPortSettings {
  createCommand: Type<CreateOtpCommandInterface>;
  consumeCommand: Type<ConsumeOtpCommandInterface>;
  clearCommand: Type<ClearOtpsCommandInterface>;
  validateQuery: Type<ValidateOtpQueryInterface>;
}
```

| Method | Signature | Description |
| --- | --- | --- |
| `create` | `(ctx, category, assigneeId)` | Create OTP with rate limiting support |
| `consume` | `(ctx, category, passcode)` | Validate and consume OTP (single-use) |
| `validate` | `(ctx, category, passcode)` | Validate OTP without consuming |
| `clear` | `(ctx, category, assigneeId)` | Remove all OTPs for user+category |

### InvitationUserPort

Settings:
```ts
interface InvitationUserPortSettings {
  getByIdQuery: Type<GetUserByIdQueryInterface>;
  getByEmailQuery: Type<GetUserByEmailQueryInterface>;
}
```

| Method | Signature | Description |
| --- | --- | --- |
| `getById` | `(ctx, userId)` | Fetch user by ID |
| `getByEmail` | `(ctx, email)` | Fetch user by email |

Returns `InvitationUserResult = (ReferenceIdInterface & InvitationUserInterface) | null`.

### InvitationEmailPort

Settings:
```ts
interface InvitationEmailPortSettings {
  sendInvitationCommand: Type<SendInvitationEmailCommandInterface>;
  sendAcceptedCommand: Type<SendAcceptedEmailCommandInterface>;
}
```

| Method | Signature | Description |
| --- | --- | --- |
| `sendInvitation` | `(ctx, invitation, { passcode, tokenExp })` | Send invitation email |
| `sendAccepted` | `(ctx, invitation)` | Send acceptance confirmation email |

Both methods receive the full `InvitationEventPayloadInterface` object. The
port resolves user details (e.g. email address) via its own user lookup.

## Policies

### InvitationOtpPolicy

Behavioral configuration for OTP handling.

| Property | Type | Description |
| --- | --- | --- |
| `namespace` | `string` | OTP namespace |
| `type` | `string` | OTP type (uuid, numeric, etc.) |
| `expiresIn` | `string` | Expiration duration |
| `clearOtpOnCreate` | `boolean` | Clear existing OTPs before creating |
| `rateSeconds` | `number` | Rate limit window in seconds |
| `rateThreshold` | `number` | Max creations in rate window |

### InvitationEmailPolicy

Email configuration.

| Property | Type | Description |
| --- | --- | --- |
| `from` | `string` | Sender address |
| `baseUrl` | `string` | Application base URL |
| `invitationTemplate` | `InvitationEmailTemplateSettings` | Template for invitation email |
| `acceptedTemplate` | `InvitationEmailTemplateSettings` | Template for accepted email |

```ts
interface InvitationEmailTemplateSettings {
  logo: string;
  fileName: string;
  subject: string;
}
```

## Commands

| Command | Handler | Description |
| --- | --- | --- |
| `CreateInvitationCommand` | `CreateInvitationHandler` | Create invitation with user ID + code |
| `CreateInvitationByEmailCommand` | `CreateInvitationByEmailHandler` | Create invitation by email (resolves user, generates code) |
| `SendInvitationCommand` | `SendInvitationHandler` | Resend invitation by ID (generates new OTP) |
| `AcceptInvitationCommand` | `AcceptInvitationHandler` | Validate OTP, accept, revoke siblings |
| `RevokeInvitationsCommand` | `RevokeInvitationsHandler` | Revoke all invitations for user+category |
| `RemoveInvitationCommand` | `RemoveInvitationHandler` | Hard delete an invitation |

### Dispatching a Command

```ts
import { CommandBus } from '@nestjs/cqrs';
import { CreateInvitationCommand, Invitation } from '@concepta/nestjs-invitation';

const invitation = await this.commandBus.execute<CreateInvitationCommand, Invitation>(
  new CreateInvitationCommand(ctx, {
    code: 'abc-123',
    category: 'onboarding',
    userId: 'user-1',
  }),
);
```

## Queries

| Query | Handler | Description |
| --- | --- | --- |
| `GetInvitationQuery` | `GetInvitationHandler` | Fetch invitation by ID |
| `FindInvitationByCodeQuery` | `FindInvitationByCodeHandler` | Fetch invitation by code |

### Dispatching a Query

```ts
import { QueryBus } from '@nestjs/cqrs';
import { GetInvitationQuery, Invitation } from '@concepta/nestjs-invitation';

const invitation = await this.queryBus.execute<GetInvitationQuery, Invitation | null>(
  new GetInvitationQuery(ctx, invitationId),
);
```

## Domain Events

All events carry an `eventContext` and a plain `InvitationEventPayloadInterface`
snapshot.

| Event | Emitted When | Built-in Listener |
| --- | --- | --- |
| `InvitationCreatedEvent` | `Invitation.create()` | -- |
| `InvitationDispatchedEvent` | `Invitation.dispatch()` | `InvitationDispatchedListener` -- sends invitation email |
| `InvitationAcceptedEvent` | `Invitation.accept()` | `InvitationAcceptedListener` -- sends accepted email |
| `InvitationRevokedEvent` | `Invitation.revoke()` | `InvitationRevokedListener` -- clears OTPs |
| `InvitationRemovedEvent` | `Invitation.remove()` | -- |

`InvitationDispatchedEvent` carries OTP metadata (`passcode`, `tokenExp`)
via `EventContextHost` meta. The `InvitationDispatchedListener` extracts
this metadata and passes it to the email port.

### Handling an Event

Listen for invitation events from any module. For example, to activate a user
when their invitation is accepted:

```ts
import { CommandBus, EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { InvitationAcceptedEvent } from '@concepta/nestjs-invitation';

@EventsHandler(InvitationAcceptedEvent)
export class ActivateUserOnInvitationAccepted
  implements IEventHandler<InvitationAcceptedEvent>
{
  constructor(private readonly commandBus: CommandBus) {}

  async handle(event: InvitationAcceptedEvent) {
    const { invitation } = event;

    // Only handle invitations in the 'user' category
    if (invitation.category !== 'user') return;

    // Activate the invited user
    await this.commandBus.execute(
      new UpdateUserCommand({}, invitation.userId, { active: true }),
    );
  }
}
```

Register the listener as a provider in your module to start receiving events.

## DTOs

| DTO | Fields | Purpose |
| --- | --- | --- |
| `InvitationDto` | id, code, category, userId, active, constraints, timestamps | Full invitation representation |
| `InvitationCreateDto` | category, userId, code, constraints? | Create by user ID |
| `InvitationCreateByEmailDto` | email, category, constraints? | Create by email |
| `InvitationAcceptDto` | passcode, payload? | Accept invitation |
| `InvitationPaginatedDto` | data: InvitationDto[] | Paginated response wrapper |

## Exceptions

| Exception | HTTP Status | Error Code |
| --- | --- | --- |
| `InvitationException` | -- | `INVITATION_ERROR` |
| `InvitationAlreadyAcceptedException` | -- | `INVITATION_ALREADY_ACCEPTED_ERROR` |
| `InvitationRevokedException` | -- | `INVITATION_REVOKED_ERROR` |
| `InvitationNotFoundException` | 404 | `INVITATION_NOT_FOUND_ERROR` |
| `InvitationUserUndefinedException` | -- | `INVITATION_USER_UNDEFINED_ERROR` |
| `InvitationNotAcceptedException` | 400 | `INVITATION_NOT_ACCEPTED_ERROR` |

## HTTP Gateway

The gateway layer bridges `@concepta/nestjs-crud` operations to domain
commands and queries.

### Request Handlers

| Handler | Request Class | Operation |
| --- | --- | --- |
| `CreateInvitationRequestHandler` | `CreateInvitationRequest` | Create by user ID |
| `CreateInvitationByEmailRequestHandler` | `CreateInvitationByEmailRequest` | Create by email |
| `SendInvitationRequestHandler` | `SendInvitationRequest` | Send/resend invitation |
| `AcceptInvitationRequestHandler` | `AcceptInvitationRequest` | Accept with passcode |
| `DeleteInvitationRequestHandler` | `DeleteInvitationRequest` | Hard delete |
| `ListInvitationsRequestHandler` | `ListInvitationsRequest` | Paginated list |
| `ReadInvitationRequestHandler` | `ReadInvitationRequest` | Read single |

### Wiring with CrudModule

```ts
import { Module } from '@nestjs/common';
import { InvitationInterface, Operation } from '@concepta/nestjs-common';
import { CrudCqrsResolver, CrudModule } from '@concepta/nestjs-crud';
import {
  InvitationModule,
  InvitationDto,
  InvitationCreateDto,
  InvitationAcceptDto,
  InvitationPaginatedDto,
  CreateInvitationRequest,
  CreateInvitationRequestHandler,
  AcceptInvitationRequest,
  AcceptInvitationRequestHandler,
} from '@concepta/nestjs-invitation';

@Module({
  imports: [
    InvitationModule.forRoot({ /* options */ }),
    CrudModule.forFeature<InvitationInterface>({
      crud: {
        controller: {
          entity: 'invitation',
          path: 'invitation',
          resolver: CrudCqrsResolver,
          transactional: true,
          request: { body: InvitationCreateDto },
          response: { resource: InvitationDto, paginated: InvitationPaginatedDto },
        },
        operations: [
          {
            operation: Operation.Create,
            request: { body: InvitationCreateDto },
            command: CreateInvitationRequest,
            commandHandler: CreateInvitationRequestHandler,
          },
          {
            operation: Operation.Update,
            request: { body: InvitationAcceptDto },
            command: AcceptInvitationRequest,
            commandHandler: AcceptInvitationRequestHandler,
          },
        ],
      },
    }),
  ],
})
export class InvitationFeatureModule {}
```

## Entry Points

| Import Path | Contents |
| --- | --- |
| `@concepta/nestjs-invitation` | Module, aggregate, commands, queries, events, handlers, ports, policies, DTOs, repository, mapper, exceptions |
| `@concepta/nestjs-invitation/optional/typeorm` | `InvitationSqliteEntity`, `InvitationPostgresEntity` |

## Seeding

An `InvitationFactory` is available for test seeding:

```ts
import { InvitationFactory } from '@concepta/nestjs-invitation';
```

The factory generates random `code` and `category` values using `crypto.randomUUID()`
and `faker.person.jobType()`.

## Default Configuration

| Setting | Default |
| --- | --- |
| `email.from` | `no-reply@dispostable.com` |
| `email.baseUrl` | `http://localhost:3000` |
| `email.templates.invitation.subject` | `Access Invitation` |
| `email.templates.invitationAccepted.subject` | `Invitation Accepted` |
| `otp.namespace` | `user-otp` |
| `otp.type` | `uuid` |
| `otp.expiresIn` | `7d` |
| `otp.clearOtpOnCreate` | `false` (env: `INVITATION_OTP_CLEAR_ON_CREATE`) |
