# @concepta/rockets-app

Application-level module that wires Rockets framework primitives into a NestJS
application. Register it once at the root and all Rockets features it provides
become globally available without importing them in every module.

Provides: **hook system** · **per-request context overlays** · **domain
exceptions** · **event context** · **aggregate base classes** · **testing
utilities**.

## Project

[![NPM Latest](https://img.shields.io/npm/v/@concepta/rockets-app)](https://www.npmjs.com/package/@concepta/rockets-app)
[![NPM Downloads](https://img.shields.io/npm/dw/@concepta/rockets-app)](https://www.npmjs.com/package/@concepta/rockets-app)
[![GH Last Commit](https://img.shields.io/github/last-commit/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets)
[![GH Contrib](https://img.shields.io/github/contributors/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets/graphs/contributors)
[![NestJS Dep](https://img.shields.io/github/package-json/dependency-version/conceptadev/rockets/@nestjs/common?label=NestJS&logo=nestjs&filename=packages%2Fnestjs-core%2Fpackage.json)](https://www.npmjs.com/package/@nestjs/common)

## Table of Contents

- [Installation](#installation)
- [Module Registration](#module-registration)
- [Hook Feature](#hook-feature)
  - [Defining a Hook](#defining-a-hook)
  - [Attaching Hooks to Controllers](#attaching-hooks-to-controllers)
  - [Specification Guards](#specification-guards)
  - [Consuming Hooks](#consuming-hooks)
- [Context System](#context-system)
- [Exceptions](#exceptions)
- [Event Context](#event-context)
- [Aggregate](#aggregate-concepta-rockets-appaggregate-subpath)
- [Testing](#testing-concepta-rockets-apptesting-subpath)
- [API Reference](#api-reference)

## Installation

```sh
yarn add @concepta/rockets-app
```

### Subpath exports

| Import path | What it provides |
| --- | --- |
| `@concepta/rockets-app` | Full public surface: hooks, context, exceptions, references, utilities, enums, DTOs. |
| `@concepta/rockets-app/aggregate` | `DomainAggregate`, `DomainMapper`, `DomainAggregateDto`, `AggregateMetaInterface`. |
| `@concepta/rockets-app/testing` | `createMockEventPublisher`, `createMockCommandBus`, `createMockQueryBus`. |

### Dependencies

Direct dependencies: `@nestjs/common`, `@nestjs/core`, `@nestjs/swagger`,
`ms`, `rxjs`.

### Peer Dependencies

| Package | Required | Notes |
| --- | --- | --- |
| `class-transformer` | Yes | DTO serialization |
| `class-validator` | Yes | DTO validation |
| `rxjs` | Yes | Observable support |
| `@nestjs/cqrs` | No | Only if using CQRS patterns |

## Module Registration

Register `RocketsAppModule` once at the application root. It defaults to
`global: true` so a global `APP_INTERCEPTOR` registered by the module
intercepts requests from every controller in the app without additional imports.

### Synchronous

```ts
import { RocketsAppModule } from '@concepta/rockets-app';

@Module({
  imports: [RocketsAppModule.forRoot()],
})
export class AppModule {}
```

### Asynchronous

```ts
@Module({
  imports: [
    RocketsAppModule.forRootAsync({
      useFactory: async () => ({}),
    }),
  ],
})
export class AppModule {}
```

### Methods

| Method | Description |
| --- | --- |
| `forRoot(options?)` | Synchronous global registration. `global: true` by default. |
| `forRootAsync(options)` | Asynchronous global registration. |
| `register(options?)` | Synchronous non-global registration (manual scope control). |
| `registerAsync(options)` | Asynchronous non-global registration. |

## Hook Feature

The hook system enables conditional execution of NestJS injectable classes
(hooks) attached to controllers or methods. A global `APP_INTERCEPTOR`
registered by `RocketsAppModule` reads `@UseHooks(...)` metadata from the
current handler and attaches the resolved hook list to the request context via
`HooksCtx`. Downstream services consume the list via `HookResolverService`.

### Defining a Hook

Use `@Hook({ type })` to mark an injectable class as a hook. Methods are
decorated with subsystem-specific decorators (e.g. `@BeforeFind()`,
`@AfterCreate()` from `@concepta/nestjs-repository`).

```ts
import { Hook } from '@concepta/rockets-app';
import { RepoHook, BeforeFind } from '@concepta/nestjs-repository';

@Hook({ type: RepoHook })
export class TenantScopeHook {
  @BeforeFind()
  addTenantFilter(options: FindOptions, ctx: PlainLiteralObject): void {
    options.where = { ...options.where, tenantId: ctx.tenantId };
  }
}
```

### Attaching Hooks to Controllers

`@UseHooks(...hooks)` is applied to a controller class or a specific method.
Method-level decorators are merged with class-level decorators.

```ts
import { UseHooks } from '@concepta/rockets-app';

// Class-level — all methods get TenantScopeHook
@UseHooks(TenantScopeHook)
@Controller('users')
export class UserController {
  @Get()
  findAll() { ... }

  // Method-level addition — this method also gets AuditHook
  @UseHooks(AuditHook)
  @Delete(':id')
  delete() { ... }
}
```

`@UseHooks` also accepts `{ hook, spec }` objects to add a per-registration
specification guard:

```ts
@UseHooks(
  { hook: TenantScopeHook, spec: Spec.always() },
  { hook: AuditHook, spec: Spec.and(adminSpec, mutationSpec) },
)
@Controller('orders')
export class OrderController { ... }
```

### Specification Guards

Specifications are evaluated at runtime to decide whether a hook (or a specific
hook method) executes. Use the `Spec` factory for common compositions:

```ts
import { Spec } from '@concepta/rockets-app';

Spec.always()              // always executes
Spec.never()               // never executes (useful to disable temporarily)
Spec.and(specA, specB)     // both must be satisfied
Spec.or(specA, specB)      // either must be satisfied
Spec.not(spec)             // negates spec
```

Custom specifications implement `SpecificationInterface<Ctx>`:

```ts
import { SpecificationInterface } from '@concepta/rockets-app';

export class IsAdminSpec implements SpecificationInterface {
  isSatisfiedBy(ctx: PlainLiteralObject): boolean {
    return ctx.user?.role === 'admin';
  }
}
```

### Consuming Hooks

`HookResolverService` is exported by `RocketsAppModule` and available for
injection. It resolves and executes the matching hook methods from the request
context, passing the payload through each applicable hook in sequence.

```ts
import {
  HookResolverService,
  getAppContext,
} from '@concepta/rockets-app';
import { RepoHook } from '@concepta/nestjs-repository';

@Injectable()
export class SomeService {
  constructor(private readonly hookResolver: HookResolverService) {}

  async findAll(req: Request, options: FindOptions): Promise<FindOptions> {
    const ctx = getAppContext(req);
    // hookType is the decorator object (has KEY property); payload is what flows
    // through hooks; ctx is the full app context (resolver reads ctx.hooks internally).
    return this.hookResolver.execute(RepoHook, 'beforeFind', options, ctx);
  }
}
```

`execute<T>(hookType, methodKey, payload, ctx)` returns the payload after all
applicable hooks have processed it.

## Context System

`AppContextHost` is a per-request container of typed overlays. Each overlay
adds a `with*()` method to the context, carrying a typed set of resolved
values for that request.

`getAppContext(request)` returns the `AppContextHost` for a request, creating
one on first access.

**Defining a custom overlay:**

```ts
import {
  ContextOverlayInterceptor,
  OverlayRef,
  getAppContext,
} from '@concepta/rockets-app';
import { Injectable, ExecutionContext } from '@nestjs/common';

// Typed token — export this for consumers
export const MyCtx = new OverlayRef<'withMy', { tenantId: string }>('withMy');

@Injectable()
export class MyContextOverlay extends ContextOverlayInterceptor {
  readonly ref = MyCtx;

  attach(context: ExecutionContext): void {
    const request = context.switchToHttp().getRequest();
    const ctx = getAppContext(request);
    ctx.defineOverlay(MyCtx, { tenantId: request.headers['x-tenant-id'] });
  }
}

// Register as a global interceptor in your module:
// { provide: APP_INTERCEPTOR, useClass: MyContextOverlay }
```

**Consuming an overlay in a controller:**

```ts
import { Ctx } from '@concepta/rockets-app';

@Controller('users')
export class UserController {
  @Get()
  // @Ctx(ref) injects the resolved overlay props directly
  findAll(@Ctx(MyCtx) my: { tenantId: string }) {
    return my.tenantId;
  }
}
```

**Or read it from the raw context:**

```ts
const ctx = getAppContext(request);
const { tenantId } = ctx.with(MyCtx);
```

`ContextOverlayInterceptor` is the abstract base class for custom overlays.
Subclasses implement `ref` (the `OverlayRef` token) and `attach()` (where
`defineOverlay` is called). Register them as global `APP_INTERCEPTOR` providers.

## Exceptions

### RuntimeException

`RuntimeException` extends `Error` and adds HTTP status, safe message, and
structured context. Subclass it to define module-specific error codes.

```ts
import { RuntimeException } from '@concepta/rockets-app';
import { HttpStatus } from '@nestjs/common';

// Simple message
throw new RuntimeException('Something failed');

// With options
throw new RuntimeException({
  message: 'Entity %s not found',
  messageParams: [id],
  httpStatus: HttpStatus.NOT_FOUND,
  safeMessage: 'Resource not found',
});

// Subclass with a fixed error code
export class MyNotFoundException extends RuntimeException {
  constructor(id: string) {
    super({
      httpStatus: HttpStatus.NOT_FOUND,
      message: 'Entity %s not found',
      messageParams: [id],
    });
    this.errorCode = 'MY_NOT_FOUND_ERROR';
  }
}
```

Key options (`RuntimeExceptionOptions`):

| Option | Type | Description |
| --- | --- | --- |
| `message` | `string` | Internal (developer-facing) message. Supports `%s` via `util.format`. |
| `messageParams` | `unknown[]` | Interpolation values for `message`. |
| `safeMessage` | `string` | User-facing message. Returned in HTTP responses for 4xx status codes. |
| `safeMessageParams` | `unknown[]` | Interpolation values for `safeMessage`. |
| `httpStatus` | `HttpStatus` | HTTP status code. Defaults to `500`. |
| `originalError` | `unknown` | Original error cause (wrapped into context). |

### ExceptionsFilter

Register `ExceptionsFilter` globally to translate both `RuntimeException` and
NestJS `HttpException` into a consistent response body:

```ts
import { ExceptionsFilter } from '@concepta/rockets-app';
import { APP_FILTER } from '@nestjs/core';

// In your app module providers:
{ provide: APP_FILTER, useClass: ExceptionsFilter }
```

Response body shape: `{ statusCode, errorCode, message, timestamp }`.

For `RuntimeException`: if the status is `>= 500`, `message` is the
`safeMessage` (or a fallback string) — never the internal message.

## Event Context

`EventContextHost<H, M>` is a frozen container of request headers and metadata,
used as the first argument to aggregate factory methods and domain events. It
ensures the event-issuing context is captured immutably at the point of command
execution.

```ts
import { EventContextHost } from '@concepta/rockets-app';

const eventContext = new EventContextHost(
  { namespace: 'my-module' },  // headers
  { correlationId: '...' },    // metadata
);

eventContext.getHeader('namespace');     // 'my-module'
eventContext.getMeta('correlationId');  // '...'
```

`EventContextHost` is frozen on construction — its `headers` and `metadata`
properties cannot be mutated.

## Aggregate (`@concepta/rockets-app/aggregate` subpath)

```ts
import {
  DomainAggregate,
  DomainMapper,
  DomainAggregateDto,
  AggregateMetaInterface,
} from '@concepta/rockets-app/aggregate';
```

### DomainAggregate

Abstract base class for all v8 domain aggregates. Extends
`@nestjs/cqrs` `AggregateRoot` (event sourcing support).

```ts
export class MyAggregate extends DomainAggregate<MyInterface> {
  constructor(
    id: string,
    props: MyInterface,
    version?: number,
    meta?: AggregateMetaInterface,
  ) {
    super(id, props, version, meta);
  }

  static create(eventContext: EventContextHost, dto: MyCreatable): MyAggregate {
    const agg = new MyAggregate(randomUUID(), dto);
    agg.apply(new MyCreatedEvent(eventContext, agg.toPlain()));
    return agg;
  }

  update(eventContext: EventContextHost, dto: Partial<MyCreatable>): void {
    this.props = { ...this.props, ...dto };
    this.incrementVersion();
    this.apply(new MyUpdatedEvent(eventContext, this.toPlain()));
  }
}
```

Inherited members:

| Member | Description |
| --- | --- |
| `id` | Read-only string identifier. |
| `version` | Integer version counter. |
| `meta` | `AggregateMetaInterface` — `dateCreated`, `dateUpdated`, `dateDeleted`. |
| `props` | Protected domain properties object. |
| `stampCreated()` | Sets `dateCreated` and `dateUpdated` to now. Called by the repository. |
| `stampUpdated()` | Updates `dateUpdated`. Called by the repository before save. |
| `stampDeleted()` | Sets `dateDeleted`. Called by the repository before soft-delete. |
| `incrementVersion()` | Bumps the version. Call inside mutation methods. |
| `toPlain()` | Returns `{ id, version, ...props, ...meta }` — used as persistence payload. |

### DomainMapper

Abstract mapper that converts persistence entities to domain aggregates and
back. Implement `createAggregate(entity)` — `toDomain` and `toPersistence`
are inherited.

```ts
export class MyMapper extends DomainMapper<MyEntityInterface, MyInterface, MyAggregate> {
  createAggregate(entity: MyEntityInterface): MyAggregate {
    const { id, version, dateCreated, dateUpdated, dateDeleted, ...props } = entity;
    return new MyAggregate(id, props, version, { dateCreated, dateUpdated, dateDeleted });
  }
}
```

The `nestjs-cache` package is the reference implementation for the full
aggregate + mapper + repository pattern.

## Testing (`@concepta/rockets-app/testing` subpath)

```ts
import {
  createMockEventPublisher,
  createMockCommandBus,
  createMockQueryBus,
} from '@concepta/rockets-app/testing';
```

Each factory returns a `jest-mock-extended` `DeepMockProxy` of the
corresponding CQRS class. `createMockEventPublisher` additionally pre-wires
`mergeObjectContext` to return its argument unchanged, matching real runtime
behavior.

```ts
import { Test } from '@nestjs/testing';
import { EventPublisher } from '@nestjs/cqrs';
import { createMockEventPublisher } from '@concepta/rockets-app/testing';

const moduleRef = await Test.createTestingModule({
  providers: [MyHandler],
})
  .overrideProvider(EventPublisher)
  .useValue(createMockEventPublisher())
  .compile();
```

## API Reference

### Module

| Export | Description |
| --- | --- |
| `RocketsAppModule` | The root module. Registers a global `APP_INTERCEPTOR` for hook context and exports `HookResolverService`. |

### Hook Decorators

| Export | Description |
| --- | --- |
| `@UseHooks(...hooks)` | Controller/method decorator. Attaches hook classes (or `{ hook, spec }` objects) to the handler. |
| `@Hook(options)` | Class decorator. Marks a class as a hook, applies `@Injectable()`, and pre-computes method mappings. |
| `@Specification(spec)` | Class/method decorator. Attaches a default specification to a hook class or method. |
| `createHookMethodDecorator(key)` | Factory for creating subsystem-specific hook method decorators (e.g. `@BeforeFind`). |

### Hook Runtime

| Export | Description |
| --- | --- |
| `HookResolverService` | Resolves and executes hook methods for a given hook type and method key. |
| `HooksCtx` | `OverlayRef` token for the hook context. Use with `ctx.with(HooksCtx)` or `@Ctx(HooksCtx)`. |

### Hook Types and Interfaces

| Export | Description |
| --- | --- |
| `SpecificationInterface<Ctx>` | Contract: `isSatisfiedBy(context): boolean`. |
| `HookOption` | Union: a bare hook class, or a `HookWithSpec` configuration object. |
| `HookWithSpec` | `{ hook, type?, spec? }` — a hook class paired with an optional spec guard. |
| `HookTypeInterface` | Interface for hook type constants. Requires `readonly KEY: string`. |
| `HookContextInterface` | Request-scoped context carrying the resolved `hooks: HookWithSpec[]` array. |
| `HookMethodKeyType` | String key that identifies a hook method slot (e.g. `'beforeFind'`). |

### Specification Classes

| Export | Description |
| --- | --- |
| `Spec` | Factory for common specifications: `always()`, `never()`, `and()`, `or()`, `not()`. |
| `CompositeSpecification<Ctx>` | Abstract base for custom composite specifications. |
| `AlwaysSpecification` | Always returns `true`. |
| `NeverSpecification` | Always returns `false`. |
| `AndSpecification` | Returns `true` if both left and right specs are satisfied. |
| `OrSpecification` | Returns `true` if either left or right spec is satisfied. |
| `NotSpecification` | Negates the wrapped specification. |

### Context System

| Export | Description |
| --- | --- |
| `AppContextHost` | Per-request overlay container. Use `defineOverlay`, `with`, `require`, `supports`, `optional`. Static `from(value?)` coerces `AppContextLike` to a host. |
| `getAppContext(request)` | Returns the `AppContextHost` for a request, creating one on first access. |
| `Ctx` | Parameter decorator. Without args: injects the raw `AppContextHost`. With an `OverlayRef`: unwraps the overlay via `appCtx.with(ref)`. |
| `OverlayRef` | Typed token for a named overlay. Construct with `new OverlayRef<Name, Props>('withName')`. |
| `ContextOverlayInterceptor` | Abstract base for custom overlays. Subclasses implement `ref` and `attach()`. |
| `OverlayNotDefinedException` | Thrown when `with(ref)` is called for an overlay that was not defined on the context. |
| `AppContextInterface` | Interface implemented by `AppContextHost`. |
| `AppContextLike` | Type accepted by `AppContextHost.from()` — either an `AppContextHost` or a nullish/empty plain object. |

### Exceptions

| Export | Description |
| --- | --- |
| `RuntimeException` | Base domain exception. Extends `Error`. Accepts `httpStatus`, `safeMessage`, `messageParams`, `originalError`. |
| `RuntimeExceptionInterface` | Interface for `RuntimeException`. |
| `RuntimeExceptionOptions` | Options bag for the `RuntimeException` constructor. |
| `RuntimeExceptionContext` | Type of the `context` property on `RuntimeException`. |
| `ExceptionContext` | Alias for `RuntimeExceptionContext`. |
| `ExceptionInterface` | Minimal interface: `errorCode`, `httpStatus`, `safeMessage`. |
| `NotAnErrorException` | Wraps a non-`Error` value (e.g. a string or object) into an `Error`. Used internally by `mapNonErrorToException`. |
| `ExceptionsFilter` | `@Catch()` filter. Translates `RuntimeException` and `HttpException` into `{ statusCode, errorCode, message, timestamp }`. |

### Event Context

| Export | Description |
| --- | --- |
| `EventContextHost<H, M>` | Frozen container of `headers: H` and `metadata: M`. Passed as first arg to aggregate factories and domain events. Provides `getHeader(key)` and `getMeta(key)`. |
| `EventContextInterface<H, M>` | Interface implemented by `EventContextHost`. |

### Reference Types

| Export | Description |
| --- | --- |
| `ReferenceId` | Branded `string` type for entity IDs. |
| `ReferenceActive` | Branded `boolean` for active/inactive flag. |
| `ReferenceEmail` | Branded `string` for email addresses. |
| `ReferenceUsername` | Branded `string` for usernames. |
| `ReferenceSubject` | Branded `string` for JWT/auth subjects. |
| `ReferenceAssignment` | Branded `string` for role/scope assignment values. |
| `ReferenceIdInterface` | Interface with `id: ReferenceId`. |
| `ReferenceActiveInterface` | Interface with `active: ReferenceActive`. |
| `ReferenceEmailInterface` | Interface with `email: ReferenceEmail`. |
| `ReferenceUsernameInterface` | Interface with `username: ReferenceUsername`. |
| `ReferenceSubjectInterface` | Interface with `subject: ReferenceSubject`. |
| `ReferenceVersionInterface` | Interface with `version: number`. |

### Audit Types

| Export | Description |
| --- | --- |
| `AuditDateCreated` | Branded `Date \| null` for creation timestamp. |
| `AuditDateUpdated` | Branded `Date \| null` for last-update timestamp. |
| `AuditDateDeleted` | Branded `Date \| null` for soft-deletion timestamp. |
| `AuditVersion` | Branded `number` for optimistic-lock version. |
| `AuditInterface` | Interface with `dateCreated`, `dateUpdated`, `dateDeleted`. |
| `AuditDateCreatedInterface` | Interface with `dateCreated: AuditDateCreated`. |
| `AuditDateUpdatedInterface` | Interface with `dateUpdated: AuditDateUpdated`. |
| `AuditDateDeletedInterface` | Interface with `dateDeleted: AuditDateDeleted`. |
| `AuditVersionInterface` | Interface with `version: AuditVersion`. |

### Enums and Operation Types

| Export | Description |
| --- | --- |
| `ActionEnum` | Enum of CRUD action names (`Create`, `Read`, `Update`, `Delete`). |
| `Operation` | String-literal union of all operation names. |
| `ReadOperations` | String-literal union of read-only operation names. |
| `WriteOperations` | String-literal union of write operation names. |
| `MutateOperations` | String-literal union of mutating operation names. |
| `ReadOperation` | Branded string for a read operation value. |
| `WriteOperation` | Branded string for a write operation value. |
| `MutateOperation` | Branded string for a mutating operation value. |
| `ExceptionContext` | Type alias for `RuntimeExceptionContext` (operation context shape). |

### Utilities and Module Helpers

| Export | Description |
| --- | --- |
| `createSettingsProvider` | Factory that creates a NestJS `Provider` wiring module options to a settings token, with optional transformer support. |
| `mapNonErrorToException` | Converts any non-`Error` value to a `NotAnErrorException`; passes through real `Error` instances unchanged. |
| `mapHttpStatus` | Maps an HTTP status code to its string error-code constant. |
| `toMilliseconds` | Converts a duration string (e.g. `'1h'`) or number to milliseconds via the `ms` library. |
| `DeepPartial<T>` | Recursive `Partial<T>`. |
| `LiteralObject` | `Record<string, unknown>`. |
| `DomainFactory<Creatable, Domain>` | Interface enforcing `create` and `createWithId` static factory signatures on domain aggregate classes. |
| `AssigneeRelationInterface` | Interface for entities that hold an `assignee` relation (`{ assignee: ReferenceIdInterface }`). |
| `ModuleOptionsSettingsInterface<T>` | Interface for module options that include a `settings` block and optional `settingsTransform`. |
| `ModuleOptionsControllerInterface` | Interface for module options that control whether HTTP endpoints are enabled. |
| `AuditDto` | DTO class exposing audit fields (`dateCreated`, `dateUpdated`, `dateDeleted`). |
| `ReferenceIdDto` | DTO class exposing a single `id` field. |

### Subpath: `./aggregate`

| Export | Description |
| --- | --- |
| `DomainAggregate<T>` | Abstract aggregate base extending `@nestjs/cqrs` `AggregateRoot`. |
| `DomainMapper<Entity, Props, Agg>` | Abstract mapper base. Implement `createAggregate(entity)`. |
| `DomainAggregateDto` | DTO class exposing `id`, `version`, and audit fields. |
| `AggregateMetaInterface` | Interface for aggregate audit timestamps: `dateCreated`, `dateUpdated`, `dateDeleted`. |

### Subpath: `./testing`

| Export | Description |
| --- | --- |
| `createMockEventPublisher()` | Returns a `DeepMockProxy<EventPublisher>` with `mergeObjectContext` pre-wired to return its argument. |
| `createMockCommandBus()` | Returns a `DeepMockProxy<CommandBus>`. |
| `createMockQueryBus()` | Returns a `DeepMockProxy<QueryBus>`. |
