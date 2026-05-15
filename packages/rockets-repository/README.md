# @concepta/rockets-repository

Repository abstraction module for NestJS. Provides a driver-agnostic
`RepositoryAdapter` base class, transaction management with propagation
control, and a two-level repository hook system.

## Project

[![NPM Latest](https://img.shields.io/npm/v/@concepta/rockets-repository)](https://www.npmjs.com/package/@concepta/rockets-repository)
[![NPM Downloads](https://img.shields.io/npm/dw/@concepta/rockets-repository)](https://www.npmjs.com/package/@concepta/rockets-repository)
[![GH Last Commit](https://img.shields.io/github/last-commit/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets)
[![GH Contrib](https://img.shields.io/github/contributors/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets/graphs/contributors)
[![NestJS Dep](https://img.shields.io/github/package-json/dependency-version/conceptadev/rockets/@nestjs/common?label=NestJS&logo=nestjs&filename=packages%2Fnestjs-core%2Fpackage.json)](https://www.npmjs.com/package/@nestjs/common)

## Table of Contents

- [Installation](#installation)
- [Module Registration](#module-registration)
- [Architecture Overview](#architecture-overview)
- [Repository Adapter](#repository-adapter)
- [Relations and Joins](#relations-and-joins)
- [Where Clause Builder](#where-clause-builder)
- [Order Clause Builder](#order-clause-builder)
- [Transaction Management](#transaction-management)
- [Transactional Decorator](#transactional-decorator)
- [Repository Hooks](#repository-hooks)
- [Repository Registry](#repository-registry)
- [Federation](#federation)
- [Injecting Repositories](#injecting-repositories)
- [Exceptions](#exceptions)
- [Entry Points](#entry-points)

## Installation

```sh
yarn add @concepta/rockets-repository
```

### Dependencies

| Package | Notes |
| --- | --- |
| `@concepta/rockets-app` | Core interfaces and utilities |
| `@concepta/rockets-app` | Hook system for repository lifecycle events |
| `@nestjs/common` | NestJS core |
| `@nestjs/core` | Reflector for metadata |

### Peer Dependencies

| Package | Required | Notes |
| --- | --- | --- |
| `class-transformer` | Yes | DTO to entity transformation |
| `class-validator` | Yes | DTO validation |
| `rxjs` | Yes | Used by `TransactionalRunner` and interceptor |

## Module Registration

### forRoot

`forRoot()` registers the module **globally** and sets up the transaction
infrastructure (factory registry, scope, runner, interceptor).

```ts
import { RepositoryModule } from '@concepta/rockets-repository';

@Module({
  imports: [
    RepositoryModule.forRoot({
      defaultTimeout: 30000, // transaction timeout in ms (default)
    }),
  ],
})
export class AppModule {}
```

### forRootAsync

```ts
@Module({
  imports: [
    RepositoryModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        defaultTimeout: configService.get('TX_TIMEOUT', 30000),
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

### forFeature

`forFeature()` registers repository providers for specific entities. It
delegates to the driver module's own `forFeature()` method and automatically
registers entities in the repository registry and transaction factories.

```ts
import { RepositoryModule } from '@concepta/rockets-repository';
import { TypeOrmRepositoryModule } from '@concepta/rockets-repository-typeorm';

@Module({
  imports: [
    RepositoryModule.forFeature({
      module: TypeOrmRepositoryModule,
      entities: [
        { key: 'orders', entity: Order },
        { key: 'customers', entity: Customer },
      ],
    }),
  ],
})
export class OrderModule {}
```

Each entity registration creates a dynamic repository provider that can be
injected by key using `@InjectDynamicRepository()`.

### Settings

```ts
interface RepositoryModuleOptionsInterface {
  defaultTimeout?: number; // Transaction timeout in milliseconds (default: 30000)
}
```

## Architecture Overview

```text
Application Code
  |
RepositoryModule (forRoot / forFeature)
  |
  +-- RepositoryAdapter (abstract, driver-agnostic)
  |     Concrete implementations: TypeOrmRepository, etc.
  |
  +-- Transaction Layer
  |     TransactionScope -> TransactionManager -> TransactionFactory
  |
  +-- Hook System
  |     @RepoHook + @BeforeCreate / @AfterFind / etc.
  |
  +-- Registry
        RepositoryRegistryService (duplicate key detection at bootstrap)
```

- **RepositoryAdapter** -- abstract base class implementing
  `RepositoryInterface` with query, create, update, delete, and lifecycle
  operations
- **Transaction Layer** -- `TransactionScope` orchestrates transaction
  lifecycle with propagation control; `TransactionManager` manages active
  transactions with stack-based nesting; factories are registered per
  driver/datasource
- **Hook System** -- two-level decorators (high-level semantic + fine-grained)
  for cross-cutting concerns like auditing, tenant filtering, and validation
- **Registry** -- validates at application bootstrap that no duplicate
  repository keys exist across features

## Repository Adapter

`RepositoryAdapter` is the abstract base class that all driver-specific
repository implementations extend. It implements `RepositoryInterface`.

### Abstract Methods

Concrete implementations must provide these methods:

| Category | Method | Signature |
| --- | --- | --- |
| Query | `find` | `(options?) => Promise<Entity[]>` |
| Query | `findOne` | `(options) => Promise<Entity \| null>` |
| Query | `count` | `(options?) => Promise<number>` |
| Query | `findAndCount` | `(options?) => Promise<[Entity[], number]>` |
| Create | `create` | `(entity, options?) => Promise<Entity>` |
| Create | `createMany` | `(entities, options?) => Promise<Entity[]>` |
| Update | `update` | `(entity, data, options?) => Promise<Entity>` |
| Update | `upsert` | `(entity, options?) => Promise<Entity>` |
| Update | `replace` | `(entity, data, options?) => Promise<Entity>` |
| Delete | `delete` | `(entity, options?) => Promise<Entity>` |
| Delete | `deleteMany` | `(entities, options?) => Promise<Entity[]>` |
| Delete | `softDelete` | `(entity, options?) => Promise<Entity>` |
| Lifecycle | `restore` | `(entity, options?) => Promise<Entity>` |
| Utility | `transform` | `(entityLike) => Entity` |
| Utility | `merge` | `(mergeIntoEntity, ...entityLikes) => Entity` |

### Concrete Methods

| Method | Description |
| --- | --- |
| `prepare(dto)` | Transform DTO to entity instance using `class-transformer` |
| `getPrimaryColumns()` | Get primary key column names from metadata |
| `toDnf(clause)` | Convert `WhereClause` AST to Disjunctive Normal Form |
| `runHooks(methodKey, payload, ctx)` | Execute repository hooks for a lifecycle event |

### Implementing a Repository

```ts
import { RepositoryAdapter } from '@concepta/rockets-repository';

class TypeOrmRepository<Entity> extends RepositoryAdapter<Entity> {
  readonly metadata = { /* ... */ };

  async find(options?) {
    return this.repo.find(options);
  }

  async create(entity, options?) {
    return this.repo.save(entity);
  }

  // ... implement remaining abstract methods
}
```

## Relations and Joins

Repository find options accept a `join` array of `JoinClause` entries to load
related entities alongside the root query.

### JoinClause

Each `JoinClause` describes how to join a related entity:

```ts
interface JoinClause {
  relation: string;           // relation name (must match entity metadata)
  joinType?: 'LEFT' | 'INNER';  // default: 'LEFT'
}
```

Structural properties (`on`, `through`, `cardinality`) are resolved
automatically from entity relation metadata by `RepositoryAdapter.resolveJoinClauses()`.

### Join Helper

The `Join` helper builds `JoinClause` arrays:

```ts
import { Join } from '@concepta/rockets-repository';

// Load a single relation (LEFT join by default)
const [users, total] = await userRepo.findAndCount({
  ...Join.join(Join.left('company')),
});
// users[0].company → Company | null

// Multiple relations with different join types
const [users, total] = await userRepo.findAndCount({
  ...Join.join(
    Join.left('posts'),
    Join.inner('company'),
  ),
});

// Many-to-many (junction configured in relation metadata)
const [users, total] = await userRepo.findAndCount({
  ...Join.join(Join.left('roles')),
});
```

### Join Methods

| Method | Description |
| --- | --- |
| `left(relation)` | LEFT JOIN (default — includes rows with no match) |
| `inner(relation)` | INNER JOIN (excludes rows with no match) |
| `join(...clauses)` | Wrap join clauses into `{ join: clauses }` for passing to `find()` |

### Filtering by Relations

Use `Where.rel()` to filter by fields on a related entity. The relation
must be included in the join:

```ts
const w = Where.for<UserEntity>();

const [users, total] = await userRepo.findAndCount({
  ...Join.join(Join.left('posts')),
  ...w.where(
    w.and(
      w.eq('status', 'active'),
      w.rel('posts', Where.eq<PostEntity>('published', true)),
    ),
  ),
});
```

### Sorting by Relations

Use `OrderBy.rel()` to sort by fields on a related entity:

```ts
const o = OrderBy.for<UserEntity>();

const [users, total] = await userRepo.findAndCount({
  ...Join.join(Join.left('posts')),
  ...o.order(
    o.rel('posts', OrderBy.desc<PostEntity>('createdAt')),
    o.asc('name'),
  ),
});
```

### Relation Metadata

Relation metadata is populated automatically by the ORM driver (e.g.,
`TypeOrmRepository` reads TypeORM's `RelationMetadata`). You can also
configure per-relation behavior in `forFeature()`:

```ts
RepositoryModule.forFeature({
  module: TypeOrmRepositoryModule,
  entities: [{
    key: 'users',
    entity: UserEntity,
    relations: {
      posts: { federated: true },        // use separate queries
      company: { onDelete: 'delegate' }, // defer to DB cascade settings
    },
  }],
});
```

Relations marked `federated: true` use separate queries instead of SQL
JOINs. See [Federation](#federation) for details.

## Where Clause Builder

The `Where` helper builds ORM-agnostic
`WhereClause` AST objects that `RepositoryAdapter` implementations translate
into driver-specific queries.

### How Translation Works

1. The `Where` helper builds a `WhereClause` AST (tree of conditions and
   compound operators)
2. `RepositoryAdapter.toDnf()` flattens the AST into Disjunctive Normal Form
   (an OR of ANDs)
3. The concrete driver (e.g., `TypeOrmRepository`) translates each AND-branch
   into a driver-specific query object
4. Same-field conditions within a branch are merged (e.g., `gt` + `lt` on the
   same field become a combined range)

### Static API

Pass the entity type as a generic parameter on each call:

```ts
import { Where } from '@concepta/rockets-repository';

// Simple equality
const activeOrders = await orderRepo.find(
  Where.where(Where.eq<OrderEntity>('status', 'active')),
);

// Compound conditions
const result = await orderRepo.find(
  Where.where(
    Where.and(
      Where.eq<OrderEntity>('status', 'active'),
      Where.gt<OrderEntity>('total', 100),
      Where.contains<OrderEntity>('notes', 'urgent'),
    ),
  ),
);

// OR conditions
const result = await orderRepo.find(
  Where.where(
    Where.or(
      Where.eq<OrderEntity>('status', 'shipped'),
      Where.eq<OrderEntity>('status', 'delivered'),
    ),
  ),
);
```

### Typed Builder API

Bind the entity type once with `Where.for<Entity>()`. All subsequent calls
type-check field names against the entity:

```ts
import { Where } from '@concepta/rockets-repository';

const w = Where.for<OrderEntity>();

// Simple query
const orders = await orderRepo.find(
  w.where(w.eq('status', 'active')),
);

// Nested AND/OR
const orders = await orderRepo.find(
  w.where(
    w.and(
      w.eq('status', 'active'),
      w.or(
        w.gte('total', 1000),
        w.contains('notes', 'priority'),
      ),
    ),
  ),
);

// Null checks and range
const orders = await orderRepo.find(
  w.where(
    w.and(
      w.notNull('assigneeId'),
      w.between('total', 100, 500),
    ),
  ),
);

// Set membership
const orders = await orderRepo.find(
  w.where(
    w.in('status', ['pending', 'processing', 'shipped']),
  ),
);

// Pattern matching
const orders = await orderRepo.find(
  w.where(
    w.and(
      w.starts('sku', 'ELEC-'),
      w.notContains('notes', 'cancelled'),
    ),
  ),
);
```

### Relation Conditions

Use `rel()` to tag a condition with a relation name. The condition is applied
as a filter on the related entity (see [Filtering by Relations](#filtering-by-relations)):

```ts
const w = Where.for<OrderEntity>();

// Filter orders by customer tier
const orders = await orderRepo.findAndCount({
  ...Join.join(Join.left('customer')),
  ...w.where(
    w.and(
      w.eq('status', 'active'),
      w.rel('customer', Where.eq<CustomerEntity>('tier', 'gold')),
    ),
  ),
});
```

### Condition Operators

| Method | Description |
| --- | --- |
| `eq(field, value)` | Equal |
| `ne(field, value)` | Not equal |
| `gt(field, value)` | Greater than |
| `gte(field, value)` | Greater than or equal |
| `lt(field, value)` | Less than |
| `lte(field, value)` | Less than or equal |
| `contains(field, value)` | Contains substring |
| `notContains(field, value)` | Does not contain substring |
| `starts(field, value)` | Starts with |
| `notStarts(field, value)` | Does not start with |
| `ends(field, value)` | Ends with |
| `notEnds(field, value)` | Does not end with |
| `in(field, values)` | In array |
| `notIn(field, values)` | Not in array |
| `isNull(field)` | Is null |
| `notNull(field)` | Is not null |
| `between(field, from, to)` | Between range (inclusive) |

### Compound Operators

| Method | Description |
| --- | --- |
| `and(...conditions)` | All conditions must match |
| `or(...conditions)` | Any condition must match |

### Utility Methods

| Method | Description |
| --- | --- |
| `where(clause)` | Wrap a `WhereClause` into `{ where: clause }` for passing to `find()` |
| `rel(relation, condition)` | Tag a condition with a relation name |
| `for<Entity>()` | Create a typed builder with field name checking |

## Order Clause Builder

The `OrderBy` helper builds ORM-agnostic
`OrderClause` arrays that `RepositoryAdapter` implementations translate
into driver-specific sort options.

### Static API

Pass the entity type as a generic parameter on each call:

```ts
import { OrderBy } from '@concepta/rockets-repository';

// Single sort
const users = await userRepo.find(
  OrderBy.order(OrderBy.asc<UserEntity>('name')),
);

// Multiple sorts (priority follows array order)
const users = await userRepo.find(
  OrderBy.order(
    OrderBy.desc<UserEntity>('createdAt'),
    OrderBy.asc<UserEntity>('name'),
  ),
);
```

### Typed Builder API

Bind the entity type once with `OrderBy.for<Entity>()`. All subsequent calls
type-check field names against the entity:

```ts
import { OrderBy } from '@concepta/rockets-repository';

const o = OrderBy.for<UserEntity>();

const users = await userRepo.find(
  o.order(o.desc('createdAt'), o.asc('name')),
);
```

### Relation Sorting

Use `rel()` to sort by a field on a related entity (see
[Sorting by Relations](#sorting-by-relations)):

```ts
// Sort users by post title, then by creation date
const users = await userRepo.findAndCount({
  ...Join.join(Join.left('posts')),
  ...OrderBy.order(
    OrderBy.rel('posts', OrderBy.asc<PostEntity>('title')),
    OrderBy.desc<UserEntity>('createdAt'),
  ),
});
```

### Sort Methods

| Method | Description |
| --- | --- |
| `asc(field)` | Ascending sort |
| `desc(field)` | Descending sort |

### Utility Methods

| Method | Description |
| --- | --- |
| `order(...keys)` | Wrap sort keys into `{ order: keys }` for passing to `find()` |
| `rel(relation, key)` | Tag a sort key with a relation name |
| `relDot(dotField, key)` | Extract relation from `"relation.field"` dot notation |
| `for<Entity>()` | Create a typed builder with field name checking |

### Combining Where + OrderBy

Spread both helpers into find options:

```ts
const w = Where.for<OrderEntity>();
const o = OrderBy.for<OrderEntity>();

const orders = await orderRepo.find({
  ...w.where(w.eq('status', 'active')),
  ...o.order(o.desc('createdAt')),
});
```

### Passing Context

All repository methods accept an optional `ctx` property in their options.
The `ctx` is a `PlainLiteralObject` that carries the entity key,
transaction state, and hook configuration. When `ctx` has an active `trx`
(TransactionManager), the repository automatically uses the transactional
connection — no manual wiring required.

Spread `Where.where()` into options alongside `ctx`:

```ts
const w = Where.for<OrderEntity>();

// Query within a transaction
const orders = await orderRepo.find({
  ...w.where(w.eq('status', 'active')),
  ctx,
});

// Create within a transaction
const order = await orderRepo.create(dto, { ctx });

// Nested service calls share the same transaction via ctx
await this.txScope.run(ctx, async () => {
  const orders = await orderRepo.find({
    ...w.where(w.gt('total', 100)),
    ctx,
  });
  await auditRepo.create({ action: 'query', count: orders.length }, { ctx });
});
```

The `ctx` is propagated through nested `TransactionScope.run()` calls. Inner
calls join the outer transaction automatically — only the outermost call owns
the commit/rollback lifecycle. See [Transaction Management](#transaction-management)
for details.

## Transaction Management

The transaction layer provides automatic transaction lifecycle management
with propagation control and nested transaction support.

### TransactionScope

`TransactionScope` is the primary API for running operations within
transactions. It is provided globally by `RepositoryModule.forRoot()`.

```ts
import { TransactionScope } from '@concepta/rockets-repository';

@Injectable()
export class OrderService {
  constructor(private readonly txScope: TransactionScope) {}

  async createOrder(ctx: PlainLiteralObject, dto: CreateOrderDto) {
    return this.txScope.run(ctx, async (trx) => {
      // All repository operations share the same transaction
      const order = await orderRepo.create(dto);
      await inventoryRepo.update(order.itemId, { reserved: true });

      // Register post-commit callback
      trx.onCommit(ctx, () => {
        // Send confirmation email after successful commit
      });

      return order;
    });
  }
}
```

### Domain Events with mergeObjectContext

When using DDD aggregates that extend `AggregateRoot` from `@nestjs/cqrs`,
use `EventPublisher.mergeObjectContext()` to wire up event publishing, then
register `commit()` and `uncommit()` as post-commit/rollback callbacks.
This ensures domain events are only published after the transaction succeeds.

```ts
import { CommandHandler, EventPublisher, ICommandHandler } from '@nestjs/cqrs';
import { EventContextHost } from '@concepta/rockets-app';
import { TransactionScope } from '@concepta/rockets-repository';

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  constructor(
    private readonly txScope: TransactionScope,
    private readonly eventPublisher: EventPublisher,
    private readonly repositoryResolver: OrderRepositoryResolver,
  ) {}

  async execute(command: CreateOrderCommand): Promise<Order> {
    const { ctx, namespace, dto } = command;

    const orderRepo = this.repositoryResolver.resolve(namespace);

    const eventContext = new EventContextHost({ namespace }, {});

    return this.txScope.run(ctx, async (trx) => {
      const order = this.eventPublisher.mergeObjectContext(
        Order.create(eventContext, dto),
      );

      await orderRepo.save(ctx, order);

      trx.onCommit(ctx, () => order.commit());     // publish domain events
      trx.onRollback(ctx, () => order.uncommit());  // discard domain events

      return order;
    });
  }
}
```

### Propagation Behaviors

| Behavior | Description |
| --- | --- |
| `REQUIRED` | Join existing transaction or create a new one (default) |
| `SUPPORTS` | Use existing transaction if available, otherwise run without one |
| `MANDATORY` | Require an existing transaction; throw `TransactionRequiredException` if none |

```ts
// Read-only transaction (always rolls back)
await this.txScope.runReadOnly(ctx, async () => {
  return orderRepo.find();
});

// Custom propagation and timeout
await this.txScope.run(ctx, operation, {
  propagation: 'MANDATORY',
  timeout: 5000,
});
```

### Nesting

The first (outermost) `run()` call creates the `TransactionManager` and
registers it on the context. Nested `run()` calls see the existing manager
and join it. Only the outermost call owns the lifecycle (commit/rollback).

```ts
// Outermost — creates transaction
await this.txScope.run(ctx, async (trx) => {
  await serviceA.doWork(ctx); // joins existing transaction
  await serviceB.doWork(ctx); // joins existing transaction
});
// Transaction commits here (or rolls back on error)
```

### TransactionManager

`TransactionManager` is the runtime manager holding active transactions.
It supports stack-based nesting per key, lazy creation via factory registry,
and post-commit/rollback callbacks.

| Method | Description |
| --- | --- |
| `get(key)` | Get current transaction for key (null if none) |
| `getOrStart(key)` | Get existing or create via factory registry |
| `push(key, tx)` | Push new transaction, preserving current |
| `pop(key)` | Pop current transaction, restoring previous |
| `commitAll()` | Commit dirty transactions, rollback clean ones |
| `rollbackAll()` | Rollback all active transactions |
| `onCommit(fn)` | Register post-commit callback |
| `onRollback(fn)` | Register post-rollback callback |

### TransactionFactory

Each driver/datasource provides a `TransactionFactoryInterface`:

```ts
interface TransactionFactoryInterface {
  create(): TransactionInterface;
}
```

Factories are registered automatically when using `RepositoryModule.forFeature()`
with a driver module that returns `transactionFactories` in its
`DynamicRepositoryModule`.

## Transactional Decorator

The `@Transactional()` decorator wraps controller routes in transactions
declaratively. It can be applied at the class level (all routes) or method
level (individual routes).

```ts
import { Transactional } from '@concepta/rockets-repository';

@Controller('orders')
@Transactional()
export class OrderController {
  @Post()
  async create(@Body() dto: CreateOrderDto) {
    // Runs in a transaction
  }

  // Disable transaction for this route
  @Get()
  @Transactional(false)
  async list() {
    // No transaction
  }

  // Read-only transaction
  @Get(':id')
  @Transactional({ readOnly: true })
  async read(@Param('id') id: string) {
    // Read-only transaction (always rolls back)
  }
}
```

### Options

```ts
interface TransactionalOptions {
  propagation?: 'REQUIRED' | 'SUPPORTS' | 'MANDATORY';
  readOnly?: boolean;
  noRollbackFor?: Array<new (...args: any[]) => Error>;
  timeout?: number; // milliseconds (default: 30000)
}
```

- **`propagation`** -- transaction propagation behavior (default: `'REQUIRED'`)
- **`readOnly`** -- always roll back, for read-only operations (default: `false`)
- **`noRollbackFor`** -- exception types that should not trigger rollback
- **`timeout`** -- transaction timeout in milliseconds

Method-level `@Transactional()` overrides class-level settings.
Pass `false` to disable transactions for a specific method.

### TransactionalRunner

`TransactionalRunner` is used internally by `TransactionInterceptor` to
check for `@Transactional()` metadata and wrap operations. It can also be
used directly in custom interceptors:

```ts
import { TransactionalRunner } from '@concepta/rockets-repository';

@Injectable()
export class CustomInterceptor implements NestInterceptor {
  constructor(private readonly txRunner: TransactionalRunner) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const ctx = getAppContext<TransactionContextInterface>(req);
    return this.txRunner.run(
      context.getHandler(),
      context.getClass(),
      ctx,
      () => next.handle(),
    );
  }
}
```

## Repository Hooks

The hook system provides cross-cutting concerns for repository operations.
Hooks are resolved at runtime via `@concepta/rockets-app` and can be scoped
to specific entities using specifications.

### Defining a Hook

```ts
import {
  RepoHook,
  BeforeFind,
  AfterCreate,
} from '@concepta/rockets-repository';

@RepoHook()
export class AuditHook {
  @BeforeFind()
  addTenantFilter(options, ctx) {
    // Modify query options before find
    return { ...options, where: { ...options.where, tenantId: ctx.tenantId } };
  }

  @AfterCreate()
  logCreation(entity, ctx) {
    // React to entity creation
    return entity;
  }
}
```

### Scoped Hooks

Use specifications to restrict a hook to specific entities:

```ts
import { Spec } from '@concepta/rockets-app';

@RepoHook(Spec.entity('User'))
export class UserOnlyHook {
  @AfterCreate()
  notifyUserCreated(result, ctx) {
    // Only runs for User entity operations
    return result;
  }
}
```

### Hook Decorators

Hooks are organized into two levels: high-level semantic decorators that
match broad categories, and fine-grained decorators for specific operations.

#### High-Level Semantic

| Decorator | Matches |
| --- | --- |
| `@BeforeRead` / `@AfterRead` | find, findOne, count, findAndCount |
| `@BeforeWrite` / `@AfterWrite` | create, createMany, update, upsert, replace |
| `@BeforeTransition` / `@AfterTransition` | softDelete, restore |
| `@BeforeDestroy` / `@AfterDestroy` | delete, deleteMany (hard delete) |

#### Fine-Grained

| Category | Decorators |
| --- | --- |
| Query | `@BeforeFind` `@AfterFind` `@BeforeFindOne` `@AfterFindOne` `@BeforeCount` `@AfterCount` `@BeforeFindAndCount` `@AfterFindAndCount` |
| Create | `@BeforeCreate` `@AfterCreate` `@BeforeCreateMany` `@AfterCreateMany` |
| Update | `@BeforeUpdate` `@AfterUpdate` `@BeforeUpsert` `@AfterUpsert` `@BeforeReplace` `@AfterReplace` |
| Delete | `@BeforeDelete` `@AfterDelete` `@BeforeDeleteMany` `@AfterDeleteMany` |
| Lifecycle | `@BeforeSoftDelete` `@AfterSoftDelete` `@BeforeRestore` `@AfterRestore` |

Hook methods receive the operation payload and an optional context, and must
return the (possibly modified) payload.

## Repository Registry

`RepositoryRegistryService` validates at application bootstrap that no
duplicate repository keys exist across `forFeature()` calls. If duplicates
are found, it throws `RepositoryDuplicateKeyException` with details about
which keys conflict.

```ts
// These two registrations would conflict at bootstrap:
RepositoryModule.forFeature({
  module: TypeOrmRepositoryModule,
  entities: [{ key: 'users', entity: UserEntity }],
});

RepositoryModule.forFeature({
  module: TypeOrmRepositoryModule,
  entities: [{ key: 'users', entity: AdminEntity }], // duplicate key!
});
// Throws: Duplicate repository keys: "users" (registered for UserEntity, attempted for AdminEntity)
```

## Federation

When a relation is marked `federated: true` (see
[Relation Metadata](#relation-metadata)), the `FederationOrchestrator`
intercepts `findAndCount` calls and executes **separate queries** for the
root entity and each relation instead of using SQL JOINs. Results are
hydrated together transparently.

This is useful when:
- JOINs produce expensive Cartesian products
- Relations live in different datasources
- Precise pagination control is needed (JOINs inflate row counts)

### How It Works

The caller uses the same `join`, `Where.rel()`, and `OrderBy.rel()` APIs
described in [Relations and Joins](#relations-and-joins). The orchestrator
analyzes the query and picks a strategy:

| Strategy | When | Flow |
| --- | --- | --- |
| **ROOT_FIRST** | No relation filters or sorts | Query root → fetch relations in parallel → hydrate |
| **RELATION_FIRST** | Has relation filters or sorts | Query relations → discover root IDs → fetch constrained roots → hydrate |

ROOT_FIRST is the common case: one root query plus one query per relation,
all relations fetched in parallel.

RELATION_FIRST handles queries that filter or sort by relation fields. It
iteratively queries the driving relation to discover matching root entity
IDs, then fetches only those roots.

### distinctFilter

For many-cardinality federated relations that use sorts or filters, provide
a `distinctFilter` to ensure one relation entity per root (required for
deterministic ordering):

```ts
relations: {
  posts: {
    federated: true,
    distinctFilter: Where.eq('isPrimary', true),
  },
},
```

### Constants

| Constant | Default | Description |
| --- | --- | --- |
| `FEDERATION_DEFAULT_LIMIT` | 10 | Default page size when none specified |
| `FEDERATION_MAX_ITERATIONS` | 10 | Max iterations for relation-first constraint discovery |
| `FEDERATION_MAX_BUFFER_SIZE` | 1000 | Max offset before aborting iterative discovery |

### Limitations

- OR conditions across federated relations are not supported (throws
  `FederationException`)
- Only `findAndCount` is federated; `find`, `findOne`, and `count` use
  standard ORM queries

## Injecting Repositories

Use `@InjectDynamicRepository()` to inject
repositories registered via `forFeature()`:

```ts
import { InjectDynamicRepository } from '@concepta/rockets-repository';

@Injectable()
export class OrderService {
  constructor(
    @InjectDynamicRepository('orders')
    private readonly orderRepo: RepositoryInterface<Order>,
  ) {}

  async findAll() {
    return this.orderRepo.find();
  }
}
```

The injection token is derived from the `key` provided in
`RepositoryProviderOptions`.

## Exceptions

| Exception | Description |
| --- | --- |
| `RepositoryDuplicateKeyException` | Duplicate repository keys detected at bootstrap |
| `TransactionRequiredException` | `MANDATORY` propagation requires a transaction but none exists |
| `TransactionTimeoutException` | Transaction exceeded timeout duration |
| `FederationException` | Unsupported federated query (e.g., OR across federated relations) |

## Entry Points

| Import Path | Contents |
| --- | --- |
| `@concepta/rockets-repository` | Module, adapter, repository interfaces, Where/OrderBy/Join builders, transaction management, hooks, federation, decorators, exceptions |
| `@concepta/rockets-repository/testing` | `createMockTransaction`, `createMockRepository`, `MockTransactionHandle` |
