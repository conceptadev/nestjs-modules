# @concepta/rockets-crud

Decorator-driven CRUD module for NestJS. Generates REST endpoints from
configuration, with per-method option customization and three controller
build modes: fully generated, pre-decorated, and hybrid.

## Project

[![NPM Latest](https://img.shields.io/npm/v/@concepta/rockets-crud)](https://www.npmjs.com/package/@concepta/rockets-crud)
[![NPM Downloads](https://img.shields.io/npm/dw/@concepta/rockets-crud)](https://www.npmjs.com/package/@concepta/rockets-crud)
[![GH Last Commit](https://img.shields.io/github/last-commit/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets)
[![GH Contrib](https://img.shields.io/github/contributors/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets/graphs/contributors)
[![NestJS Dep](https://img.shields.io/github/package-json/dependency-version/conceptadev/rockets/@nestjs/common?label=NestJS&logo=nestjs&filename=packages%2Fnestjs-core%2Fpackage.json)](https://www.npmjs.com/package/@nestjs/common)

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Module Registration](#module-registration)
- [Architecture Overview](#architecture-overview)
- [Controller Build Modes](#controller-build-modes)
- [Operation Decorators](#operation-decorators)
- [Route Option Decorators](#route-option-decorators)
- [Query String Parameters](#query-string-parameters)
- [Paginated Response](#paginated-response)
- [Serialization and Validation](#serialization-and-validation)
- [Resolvers](#resolvers)
- [CQRS Integration](#cqrs-integration)
- [Specifications and Hooks](#specifications-and-hooks)
- [Exceptions](#exceptions)
- [Entry Points](#entry-points)

## Installation

```sh
yarn add @concepta/rockets-crud
```

### Dependencies

| Package | Notes |
| --- | --- |
| `@concepta/rockets-app` | Core interfaces and utilities |
| `@concepta/rockets-repository` | Repository abstraction layer |
| `@concepta/rockets-app` | Hook system integration |
| `@nestjs/common` | NestJS core |
| `@nestjs/core` | Module reference and reflection |
| `@nestjs/swagger` | OpenAPI decorator support |

### Peer Dependencies

| Package | Required | Notes |
| --- | --- | --- |
| `class-transformer` | Yes | Response serialization and DTO transformation |
| `class-validator` | Yes | Request body validation |
| `rxjs` | Yes | Interceptor pipeline |
| `@concepta/rockets-repository-typeorm` | No | TypeORM repository driver |
| `@nestjs/cqrs` | No | Only when using `CrudCqrsResolver` |

## Quick Start

Define an entity, DTOs, and register a fully generated CRUD endpoint.

### Entity

```ts
import { Entity, PrimaryGeneratedColumn, Column, DeleteDateColumn } from 'typeorm';

@Entity()
export class PhotoEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  description!: string;

  @Column({ default: 0 })
  views!: number;

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date | null;
}
```

### DTOs

```ts
import { Exclude, Expose, Type } from 'class-transformer';
import { IsString, IsUUID, IsNumber, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CrudResponsePaginatedDto } from '@concepta/rockets-crud';

@Exclude()
export class PhotoDto {
  @ApiProperty() @Expose() @IsUUID()
  id: string = '';

  @ApiProperty() @Expose() @IsString()
  name: string = '';

  @ApiProperty() @Expose() @IsString()
  description: string = '';

  @ApiProperty() @Expose() @IsNumber()
  views: number = 0;
}

@Exclude()
export class PhotoCreateDto {
  @ApiProperty() @Expose() @IsString()
  name: string = '';

  @ApiProperty() @Expose() @IsString() @IsOptional()
  description: string = '';
}

@Exclude()
export class PhotoPaginatedDto extends CrudResponsePaginatedDto<PhotoDto> {
  @ApiProperty({ type: [PhotoDto], isArray: true })
  @Expose()
  @Type(() => PhotoDto)
  data: PhotoDto[] = [];
}
```

### Feature Module

```ts
import { Module } from '@nestjs/common';
import { Operation } from '@concepta/rockets-app';
import { RepositoryModule } from '@concepta/rockets-repository';
import { TypeOrmRepositoryModule } from '@concepta/rockets-repository-typeorm';
import { CrudModule } from '@concepta/rockets-crud';

@Module({
  imports: [
    RepositoryModule.forFeature({
      module: TypeOrmRepositoryModule,
      entities: [{ key: 'photo', entity: PhotoEntity }],
    }),
    CrudModule.forFeature<PhotoEntity>({
      crud: {
        controller: {
          path: 'photos',
          entity: 'photo',
          request: { body: PhotoDto },
          response: {
            resource: PhotoDto,
            paginated: PhotoPaginatedDto,
          },
        },
        operations: [
          { operation: Operation.List },
          { operation: Operation.Read },
          { operation: Operation.Create, request: { body: PhotoCreateDto } },
          { operation: Operation.Update },
          { operation: Operation.Delete },
        ],
      },
    }),
  ],
})
export class PhotoModule {}
```

### App Module

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepositoryModule } from '@concepta/rockets-repository';
import { CrudModule } from '@concepta/rockets-crud';

@Module({
  imports: [
    TypeOrmModule.forRoot({ /* ... */ }),
    RepositoryModule.forRoot({}),
    CrudModule.forRoot({}),
    PhotoModule,
  ],
})
export class AppModule {}
```

### Generated Endpoints

| Method | Path | Operation |
| --- | --- | --- |
| GET | `/photos` | List (paginated) |
| GET | `/photos/:id` | Read |
| POST | `/photos` | Create |
| PATCH | `/photos/:id` | Update |
| DELETE | `/photos/:id` | Delete |

## Module Registration

### forRoot / forRootAsync

Global registration. Required once per application.

```ts
CrudModule.forRoot({})

// Async with factory
CrudModule.forRootAsync({
  useFactory: async () => ({}),
})
```

### forFeature

Per-entity registration. Generates a controller, adapter provider, and
(optionally) CQRS query/command handlers from the configuration object.

```ts
CrudModule.forFeature<PhotoEntity>({
  crud: {
    controller: {
      path: 'photos',
      entity: 'photo',
      request: { body: PhotoDto },
      response: { resource: PhotoDto, paginated: PhotoPaginatedDto },
    },
    operations: [
      { operation: Operation.List },
      { operation: Operation.Read },
      { operation: Operation.Create, request: { body: PhotoCreateDto } },
      { operation: Operation.Update, request: { body: PhotoUpdateDto } },
      { operation: Operation.Delete },
      { operation: Operation.SoftDelete, path: 'soft/:id' },
      { operation: Operation.Restore, path: 'restore/:id' },
    ],
  },
})
```

### register / registerAsync

Non-global variants of `forRoot`. Identical options, scoped to the importing
module.

## Architecture Overview

```text
HTTP Request
  |
Controller (generated or hand-written)
  |  @CrudController + @CrudList / @CrudCreate / ...
  |
CrudContextOverlay
  |  Parses params, query string into CrudContextInterface
  |
CrudResolver (dispatches operation)
  |
  +-- CrudAdapterResolver  (direct adapter call — default)
  +-- CrudOperationResolver (handler call, no CQRS bus)
  +-- CrudCqrsResolver      (QueryBus / CommandBus)
  |
CrudAdapter
  |  Wraps RepositoryInterface for CRUD semantics
  |
RepositoryAdapter (@concepta/rockets-repository)
  |
Database Driver (TypeORM, etc.)
```

- **Controller** — Decorated class with operation methods. Can be fully
  generated, hand-written, or a hybrid of both.
- **CrudContextOverlay** — Parses the HTTP request into a
  `CrudContextInterface` (entity name, route params, query string, options)
  and defines it as an overlay on the request context.
- **Resolver** — Dispatches the operation to the adapter directly, through
  a handler, or through the CQRS bus.
- **CrudAdapter** — Wraps a `RepositoryInterface` and adds pagination,
  field filtering, where-clause building, and entity preparation.

### Operation-to-Repository Mapping

| Operation | Adapter Method | Repository Method |
| --- | --- | --- |
| List | `list()` | `findAndCount()` |
| Read | `read()` | `findOne()` |
| Create | `create()` | `create()` |
| CreateBatch | `createBatch()` | `createMany()` |
| Update | `update()` | `update()` |
| Replace | `replace()` | `replace()` |
| Delete | `delete()` | `delete()` |
| SoftDelete | `softDelete()` | `softDelete()` |
| Restore | `restore()` | `restore()` |

## Controller Build Modes

`ConfigurableCrudBuilder` supports three controller build paths.

### Fully Generated

Zero hand-written controller code. Pass controller options and an operations
array — the builder generates the controller class, methods, and providers.

```ts
import { Operation } from '@concepta/rockets-app';
import { ConfigurableCrudBuilder } from '@concepta/rockets-crud';

const builder = new ConfigurableCrudBuilder<PhotoEntity>({
  controller: {
    path: 'photos',
    entity: 'photo',
    request: { body: PhotoDto },
    response: { resource: PhotoDto, paginated: PhotoPaginatedDto },
  },
  operations: [
    { operation: Operation.List },
    { operation: Operation.Read },
    { operation: Operation.Create, request: { body: PhotoCreateDto } },
    { operation: Operation.Update, request: { body: PhotoUpdateDto } },
    { operation: Operation.Delete },
  ],
});

const { controllers, providers } = builder.build();
```

Or use `CrudModule.forFeature()` which wraps the builder internally
(see [Module Registration](#module-registration)).

### Pre-Decorated

Full control. You write the controller class with all decorators and method
implementations. The builder extracts handler metadata for provider registration.

```ts
import { Inject } from '@nestjs/common';
import { Ctx } from '@concepta/rockets-app';
import {
  CrudController,
  CrudList,
  CrudRead,
  CrudCreate,
  CrudBody,
  CrudAdapterResolver,
  CrudResolverInterface,
  CrudContextInterface,
} from '@concepta/rockets-crud';

@CrudController({
  path: 'photos',
  entity: 'photo',
  request: { body: PhotoDto },
  response: { resource: PhotoDto, paginated: PhotoPaginatedDto },
})
export class PhotoController {
  constructor(
    @Inject(CrudAdapterResolver)
    private readonly resolver: CrudResolverInterface,
  ) {}

  @CrudList()
  async list(@Ctx() ctx: CrudContextInterface<PhotoEntity>) {
    return this.resolver.list(ctx);
  }

  @CrudRead()
  async read(@Ctx() ctx: CrudContextInterface<PhotoEntity>) {
    return this.resolver.read(ctx);
  }

  @CrudCreate({ request: { body: PhotoCreateDto } })
  async create(
    @Ctx() ctx: CrudContextInterface<PhotoEntity>,
    @CrudBody() dto: PhotoCreateDto,
  ) {
    return this.resolver.create(ctx, dto);
  }
}

// Register:
CrudModule.forFeature<PhotoEntity>({
  crud: { controller: { class: PhotoController } },
})
```

### Hybrid

Provide a base class and an operations array. Existing methods are augmented
with decorator metadata; missing methods are generated.

```ts
@CrudController({
  path: 'photos',
  entity: 'photo',
  request: { body: PhotoDto },
  response: { resource: PhotoDto, paginated: PhotoPaginatedDto },
})
export class PhotoController {
  constructor(
    @Inject(CrudAdapterResolver)
    private readonly resolver: CrudResolverInterface,
  ) {}

  @CrudList()
  async list(@Ctx() ctx: CrudContextInterface<PhotoEntity>) {
    // Custom list logic
    return this.resolver.list(ctx);
  }
}

// list is augmented; read and create are generated
CrudModule.forFeature<PhotoEntity>({
  crud: {
    controller: { class: PhotoController },
    operations: [
      { operation: Operation.List },
      { operation: Operation.Read },
      { operation: Operation.Create, request: { body: PhotoCreateDto } },
    ],
  },
})
```

### Comparison

| | Fully Generated | Pre-Decorated | Hybrid |
| --- | --- | --- | --- |
| Controller class | Auto-generated | You write it | You write base |
| Method implementations | Auto-generated | You write them | Mix of both |
| Decorator application | Automatic | Manual | Automatic for new |
| Best for | Standard CRUD | Full customization | Partial customization |

## Operation Decorators

Applied at method level. Each decorator sets the HTTP method, default path,
and operation metadata.

| Decorator | HTTP | Default Path | Operation |
| --- | --- | --- | --- |
| `@CrudList()` | GET | `/` | `Operation.List` |
| `@CrudRead()` | GET | `/:id` | `Operation.Read` |
| `@CrudCreate()` | POST | `/` | `Operation.Create` |
| `@CrudCreateBatch()` | POST | `/bulk` | `Operation.CreateBatch` |
| `@CrudUpdate()` | PATCH | `/:id` | `Operation.Update` |
| `@CrudReplace()` | PUT | `/:id` | `Operation.Replace` |
| `@CrudDelete()` | DELETE | `/:id` | `Operation.Delete` |
| `@CrudSoftDelete()` | DELETE | `/:id` | `Operation.SoftDelete` |
| `@CrudRestore()` | PATCH | `/restore/:id` | `Operation.Restore` |

### Operation Options

All operation decorators accept a common options object:

```ts
{
  path?: string | string[];
  request?: {
    body?: Type;                          // DTO for body validation
    bodyBatch?: Type;                     // DTO for batch body (CreateBatch)
    validation?: CrudValidationOptions;
  };
  response?: {
    serialization?: CrudSerializationOptions;
    returnDeleted?: boolean;              // Delete/SoftDelete only
    returnRestored?: boolean;             // Restore only
  };
  transactional?: boolean | TransactionalOptions;
  api?: {
    operation?: ApiOperationOptions;
    query?: ApiQueryOptions[];
    params?: ApiParamOptions;
    body?: ApiBodyOptions;
    response?: ApiResponseOptions;
  };
}
```

### Delete/Restore Response Behavior

By default, Delete, SoftDelete, and Restore return `204 No Content`. Set
`returnDeleted: true` or `returnRestored: true` to return `200 OK` with the
entity body:

```ts
{ operation: Operation.Delete, response: { returnDeleted: true } }
{ operation: Operation.SoftDelete, response: { returnDeleted: true } }
{ operation: Operation.Restore, response: { returnRestored: true } }
```

## Route Option Decorators

Route option decorators configure query behavior on a per-method basis.
Method-level settings override controller-level defaults.

| Decorator | Description |
| --- | --- |
| `@CrudFilter(filter)` | Server-side default filter conditions |
| `@CrudSort(sort)` | Default sort order |
| `@CrudJoin(join)` | Relations to join |
| `@CrudLimit(n)` | Default page size |
| `@CrudMaxLimit(n)` | Maximum allowed page size |
| `@CrudAllow(columns)` | Whitelist query-accessible columns |
| `@CrudExclude(columns)` | Blacklist columns from queries |
| `@CrudPersist(columns)` | Always include these columns in select |
| `@CrudCache(seconds)` | Cache duration (pass `false` to disable) |
| `@CrudSerialize(options)` | Serialization options (class-transformer) |
| `@CrudValidate(options)` | Validation pipe options |
| `@CrudReturnDeleted(bool)` | Return entity body on delete |
| `@CrudReturnRestored(bool)` | Return entity body on restore |

### Per-Method Example

```ts
@CrudController({
  path: 'photos',
  entity: 'photo',
  request: { body: PhotoDto },
  response: { resource: PhotoDto, paginated: PhotoPaginatedDto },
})
export class PhotoController {
  @CrudList()
  @CrudLimit(20)
  @CrudMaxLimit(100)
  @CrudSort([{ field: 'createdAt', order: 'DESC' }])
  @CrudAllow(['name', 'description', 'createdAt'])
  async list(@Ctx() ctx: CrudContextInterface<PhotoEntity>) {
    return this.resolver.list(ctx);
  }

  @CrudDelete()
  @CrudReturnDeleted(true)
  async delete(@Ctx() ctx: CrudContextInterface<PhotoEntity>) {
    return this.resolver.delete(ctx);
  }
}
```

### CrudQueryOptionsInterface

These decorators map to `CrudQueryOptionsInterface<T>`:

```ts
interface CrudQueryOptionsInterface<T> {
  allow?: EntityColumn<T>[];
  exclude?: EntityColumn<T>[];
  persist?: EntityColumn<T>[];
  filter?: QueryFilterOption<T>;
  sort?: OrderSortKey<T>[];
  limit?: number;
  maxLimit?: number;
  cache?: number | false;
  join?: JoinClause[];
}
```

## Query String Parameters

The CRUD module parses HTTP query parameters into `CrudParsedQueryInterface`
via `CrudQueryParser`.

### Parameters

| Parameter | Format | Example |
| --- | --- | --- |
| `select` | `field1,field2` | `?select=name,description` |
| `filter` | `field\|\|$op\|\|value` | `?filter=status\|\|$eq\|\|active` |
| `or` | `field\|\|$op\|\|value` | `?or=status\|\|$eq\|\|archived` |
| `sort` | `field,ASC\|DESC` | `?sort=createdAt,DESC` |
| `limit` | number | `?limit=25` |
| `offset` | number | `?offset=50` |
| `page` | number (1-indexed) | `?page=3` |
| `cache` | number (seconds) | `?cache=0` |
| `includeDeleted` | `1` or `0` | `?includeDeleted=1` |
| `s` | JSON search object | `?s={"name":{"$contains":"sunset"}}` |

### Comparison Operators

| Operator | Description |
| --- | --- |
| `$eq` | Equal |
| `$ne` | Not equal |
| `$gt` | Greater than |
| `$gte` | Greater than or equal |
| `$lt` | Less than |
| `$lte` | Less than or equal |
| `$starts` | Starts with |
| `$nstarts` | Does not start with |
| `$ends` | Ends with |
| `$nends` | Does not end with |
| `$contains` | Contains substring |
| `$ncontains` | Does not contain |
| `$in` | In list (comma-separated) |
| `$nin` | Not in list |
| `$null` | Is null (no value needed) |
| `$nnull` | Not null (no value needed) |
| `$between` | Between two values (comma-separated) |

### Filter Combination Rules

- Multiple `filter` params are AND-combined
- Multiple `or` params provide an alternative set
- When both present: `(AND of filters) OR (AND of ors)`
- The `s` (search) parameter supersedes `filter` and `or`

### Multiple Filters

```
GET /photos?filter[0]=status||$eq||active&filter[1]=views||$gt||100
```

### Relation Filters

Use dot notation to filter by related entity fields:

```
GET /photos?filter=author.name||$eq||Alice
```

## Paginated Response

List operations return a paginated response:

```ts
interface CrudResponsePaginatedInterface<T> {
  data: T[];        // Items on current page
  limit: number;    // Items per page
  count: number;    // Items on current page (data.length)
  total: number;    // Total items across all pages
  page: number;     // Current page (1-indexed)
  pageCount: number; // Total number of pages
}
```

### Creating a Paginated DTO

Extend `CrudResponsePaginatedDto` and override the `data` property with your
resource DTO type:

```ts
import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CrudResponsePaginatedDto } from '@concepta/rockets-crud';

@Exclude()
export class PhotoPaginatedDto extends CrudResponsePaginatedDto<PhotoDto> {
  @ApiProperty({ type: [PhotoDto], isArray: true })
  @Expose()
  @Type(() => PhotoDto)
  data: PhotoDto[] = [];
}
```

## Serialization and Validation

### Serialization

The CRUD module uses `class-transformer` with an exclude-all strategy. Only
properties marked with `@Expose()` are included in responses.

```ts
@Exclude()
export class PhotoDto {
  @Expose() @IsUUID()
  id: string = '';

  @Expose() @IsString()
  name: string = '';

  // Not @Expose() — excluded from response
  internalField: string = '';
}
```

`CrudSerializeInterceptor` applies the transform automatically. The resource
DTO is resolved from `@CrudResponseResource()` (or the controller-level
`response.resource`).

### Validation

Request bodies are validated via `class-validator`. The DTO specified in
`request.body` is passed to NestJS's `ValidationPipe`.

Override validation options per-route:

```ts
@CrudCreate({
  request: {
    body: PhotoCreateDto,
    validation: { whitelist: true, forbidNonWhitelisted: true },
  },
})
```

Or with the route decorator:

```ts
@CrudValidate({ whitelist: true, forbidNonWhitelisted: true })
```

## Resolvers

Resolvers control how operations are dispatched from the controller to the
adapter.

| Resolver | Dispatch | When to Use |
| --- | --- | --- |
| `CrudAdapterResolver` | Calls `CrudAdapter` directly | Default. Simple CRUD |
| `CrudOperationResolver` | Resolves handler via `ModuleRef` | Custom handler logic without CQRS |
| `CrudCqrsResolver` | Dispatches via `QueryBus` / `CommandBus` | Full CQRS with sagas and events |

### Setting the Default Resolver

Globally:

```ts
CrudModule.forRoot({
  defaultResolver: CrudOperationResolver,
})
```

Per-controller:

```ts
@CrudController({
  path: 'photos',
  entity: 'photo',
  resolver: CrudCqrsResolver,
  ...
})
```

## CQRS Integration

Optional integration with `@nestjs/cqrs` for saga, event, and cross-module
routing support.

### Setup

```sh
yarn add @nestjs/cqrs
```

```ts
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CrudModule, CrudCqrsResolver } from '@concepta/rockets-crud';

@Module({
  imports: [
    CqrsModule.forRoot(),
    CrudModule.forRoot({
      defaultResolver: CrudCqrsResolver,
    }),
  ],
})
export class AppModule {}
```

### Built-in Queries and Commands

| Operation | Class | Handler |
| --- | --- | --- |
| List | `CrudListQuery` | `CrudListHandler` |
| Read | `CrudReadQuery` | `CrudReadHandler` |
| Create | `CrudCreateCommand` | `CrudCreateHandler` |
| CreateBatch | `CrudCreateBatchCommand` | `CrudCreateBatchHandler` |
| Update | `CrudUpdateCommand` | `CrudUpdateHandler` |
| Replace | `CrudReplaceCommand` | `CrudReplaceHandler` |
| Delete | `CrudDeleteCommand` | `CrudDeleteHandler` |
| SoftDelete | `CrudSoftDeleteCommand` | `CrudSoftDeleteHandler` |
| Restore | `CrudRestoreCommand` | `CrudRestoreHandler` |

### Custom Handlers

Override the handler for a specific operation:

```ts
{ operation: Operation.Create, commandHandler: CustomCreateHandler }
```

Or with the decorator:

```ts
@CrudCreate()
@CrudCommandHandler(CustomCreateHandler)
async create(@Ctx() ctx, @CrudBody() dto) { ... }
```

## Specifications and Hooks

`CrudSpec` provides factory methods for matching CRUD operations. Specifications
act as boolean gates — a hook method only runs when its spec is satisfied by the
current `CrudContextInterface`.

### CrudSpec Methods

| Method | Description |
| --- | --- |
| `CrudSpec.operation(op)` | Match a specific operation |
| `CrudSpec.action(action)` | Match an action category |
| `CrudSpec.isCreate()` | CREATE action |
| `CrudSpec.isRead()` | READ action |
| `CrudSpec.isUpdate()` | UPDATE action |
| `CrudSpec.isDelete()` | DELETE action |
| `CrudSpec.isQuery()` | List + Read operations |
| `CrudSpec.isWrite()` | Create + CreateBatch + Update + Replace |
| `CrudSpec.isMutation()` | All state-changing operations |
| `CrudSpec.and(...)` | All specifications must match |
| `CrudSpec.or(...)` | Any specification must match |
| `CrudSpec.not(spec)` | Negate a specification |
| `CrudSpec.always()` | Always matches (default) |
| `CrudSpec.never()` | Never matches |

### Defining a Hook

Use `@RepoHook()` from `@concepta/rockets-repository` to mark a class as a
repository hook. Decorate methods with lifecycle decorators (`@BeforeCreate`,
`@AfterFind`, etc.) and optionally pass a `CrudSpec` to restrict when the
method runs:

```ts
import { Injectable } from '@nestjs/common';
import {
  RepoHook,
  BeforeFind,
  AfterCreate,
  AfterUpdate,
} from '@concepta/rockets-repository';
import { CrudSpec } from '@concepta/rockets-crud';

@Injectable()
@RepoHook()
export class AuditHook {
  // Runs on ALL find operations (no spec restriction)
  @BeforeFind()
  async addTenantFilter(options, ctx) {
    const tenantId = ctx.locals?.tenantId;
    if (tenantId) {
      // add tenant filter to query options
    }
    return options;
  }

  // Runs ONLY when the CRUD operation is a Create
  @AfterCreate(CrudSpec.isCreate())
  async logCreation(entity, ctx) {
    console.log(`Created ${ctx.operation}:`, entity.id);
    return entity;
  }

  // Runs ONLY on write operations (Create, Update, Replace)
  @AfterUpdate(CrudSpec.isWrite())
  async logModification(entity, ctx) {
    console.log(`Modified via ${ctx.operation}:`, entity.id);
    return entity;
  }
}
```

### Registering Hooks

Attach hooks to a controller with `@UseHooks()` from `@concepta/rockets-app`.
Hooks can be plain classes or `{ hook, spec }` objects:

```ts
import { UseHooks } from '@concepta/rockets-app';
import { CrudSpec } from '@concepta/rockets-crud';

// Simple: hook runs for all operations on this controller
@UseHooks(AuditHook)
@CrudController({ ... })
export class PhotoController { ... }

// With spec: hook only runs for mutations
@UseHooks({ hook: AuditHook, spec: CrudSpec.isMutation() })
@CrudController({ ... })
export class PhotoController { ... }

// Method-level: adds to class-level hooks
@UseHooks(AuditHook)
@CrudController({ ... })
export class PhotoController {
  @CrudDelete()
  @UseHooks({ hook: AdminAuditHook, spec: CrudSpec.isDelete() })
  async delete(@Ctx() ctx) { ... }
}
```

### Spec Resolution Priority

When multiple specs are defined, the most specific wins:

1. Hook method parameter: `@BeforeCreate(spec)` — highest
2. Class-level: `@RepoHook(spec)`
3. `@UseHooks({ hook, spec })` registration
4. Default: `CrudSpec.always()` — lowest

### Composing Specifications

```ts
// Write operations that are NOT deletes
CrudSpec.and(CrudSpec.isWrite(), CrudSpec.not(CrudSpec.isDelete()))

// List or Read
CrudSpec.or(
  CrudSpec.operation(Operation.List),
  CrudSpec.operation(Operation.Read),
)

// Specific operation
CrudSpec.operation(Operation.Create)
```

### Available Hook Decorators

Hook method decorators from `@concepta/rockets-repository`:

| Decorator | Fires on |
| --- | --- |
| `@BeforeRead` / `@AfterRead` | Any read (find, findOne, count, findAndCount) |
| `@BeforeWrite` / `@AfterWrite` | Any write (create, update, replace) |
| `@BeforeTransition` / `@AfterTransition` | Lifecycle changes (softDelete, restore) |
| `@BeforeDestroy` / `@AfterDestroy` | Hard delete |
| `@BeforeFind` / `@AfterFind` | `find()` |
| `@BeforeFindOne` / `@AfterFindOne` | `findOne()` |
| `@BeforeFindAndCount` / `@AfterFindAndCount` | `findAndCount()` |
| `@BeforeCreate` / `@AfterCreate` | `create()` |
| `@BeforeCreateMany` / `@AfterCreateMany` | `createMany()` |
| `@BeforeUpdate` / `@AfterUpdate` | `update()` |
| `@BeforeReplace` / `@AfterReplace` | `replace()` |
| `@BeforeDelete` / `@AfterDelete` | `delete()` |
| `@BeforeSoftDelete` / `@AfterSoftDelete` | `softDelete()` |
| `@BeforeRestore` / `@AfterRestore` | `restore()` |

## Exceptions

| Exception | Description |
| --- | --- |
| `CrudException` | Base CRUD exception |
| `CrudContextException` | Error during context building (interceptor) |
| `CrudDecoratorException` | Invalid decorator configuration |
| `CrudQueryException` | Error executing a query or command |

## Entry Points

| Import Path | Contents |
| --- | --- |
| `@concepta/rockets-crud` | Module, adapter, decorators, resolvers, CQRS queries/commands/handlers, DTOs, specifications, exceptions |
