# @concepta/rockets-repository-typeorm

TypeORM driver for `@concepta/rockets-repository`. Provides `TypeOrmRepository`
(extending `RepositoryAdapter`), `TypeOrmTransaction` / `TypeOrmTransactionFactory`
for automatic transaction management, WhereClause-to-TypeORM translation, and
database-specific base entities for Postgres and SQLite.

## Project

[![NPM Latest](https://img.shields.io/npm/v/@concepta/rockets-repository-typeorm)](https://www.npmjs.com/package/@concepta/rockets-repository-typeorm)
[![NPM Downloads](https://img.shields.io/npm/dw/@concepta/rockets-repository-typeorm)](https://www.npmjs.com/package/@concepta/rockets-repository-typeorm)
[![GH Last Commit](https://img.shields.io/github/last-commit/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets)
[![GH Contrib](https://img.shields.io/github/contributors/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets/graphs/contributors)
[![NestJS Dep](https://img.shields.io/github/package-json/dependency-version/conceptadev/rockets/@nestjs/common?label=NestJS&logo=nestjs&filename=packages%2Fnestjs-core%2Fpackage.json)](https://www.npmjs.com/package/@nestjs/common)

## Table of Contents

- [Installation](#installation)
- [Module Registration](#module-registration)
- [TypeOrmRepository](#typeormrepository)
- [WhereClause Translation](#whereclause-translation)
- [Transaction Support](#transaction-support)
- [Repository Hooks](#repository-hooks)
- [Base Entities](#base-entities)
- [Exceptions](#exceptions)
- [Entry Points](#entry-points)

## Installation

```sh
yarn add @concepta/rockets-repository-typeorm
```

### Dependencies

| Package | Notes |
| --- | --- |
| `@concepta/rockets-app` | Core interfaces and utilities |
| `@concepta/rockets-app` | Hook system for repository lifecycle events |
| `@concepta/rockets-repository` | Abstract repository layer (`RepositoryAdapter`) |
| `@nestjs/common` | NestJS core |
| `@nestjs/typeorm` | TypeORM integration for NestJS |
| `zod` | Schema validation for find options |

### Peer Dependencies

| Package | Required | Notes |
| --- | --- | --- |
| `class-transformer` | Yes | DTO to entity transformation |
| `class-validator` | Yes | DTO validation |
| `typeorm` | Yes | TypeORM ^0.3.0 |

## Module Registration

### With RepositoryModule (recommended)

Use `RepositoryModule.forFeature()` to register entities through the
TypeORM driver. This provides transaction management, repository hooks,
and duplicate key detection.

```ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RepositoryModule } from '@concepta/rockets-repository';
import { TypeOrmRepositoryModule } from '@concepta/rockets-repository-typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: 'postgres://user:pass@localhost:5432/mydb',
      entities: [OrderEntity, CustomerEntity],
    }),
    RepositoryModule.forRoot({}),
    RepositoryModule.forFeature({
      module: TypeOrmRepositoryModule,
      entities: [
        { key: 'orders', entity: OrderEntity },
        { key: 'customers', entity: CustomerEntity },
      ],
    }),
  ],
})
export class AppModule {}
```

Each entity key creates a `TypeOrmRepository` instance injectable via
`@InjectDynamicRepository(key)`.

### Direct Usage

`TypeOrmRepositoryModule` can also be used directly without `RepositoryModule`:

```ts
@Module({
  imports: [
    TypeOrmModule.forRoot({ /* ... */ }),
    TypeOrmRepositoryModule.forFeature([
      { key: 'orders', entity: OrderEntity },
      { key: 'customers', entity: CustomerEntity, dataSource: 'secondary' },
      { key: 'audit', entity: AuditLog, factory: createAuditRepository },
    ]),
  ],
})
export class AppModule {}
```

### Provider Options

```ts
interface TypeOrmProviderOptionsInterface<Entity> extends RepositoryProviderOptions<Entity> {
  key: string;                                             // Injection key
  entity: Type<Entity>;                                    // TypeORM entity class
  dataSource?: TypeOrmDataSourceToken;                     // Data source (default: 'default')
  factory?: (dataSource: DataSource) => Repository<Entity>; // Custom repository factory
}
```

- **`key`** -- string key used with `@InjectDynamicRepository(key)`
- **`entity`** -- TypeORM entity class
- **`dataSource`** -- optional data source name, `DataSource` instance, or
  `DataSourceOptions`; defaults to `'default'`
- **`factory`** -- optional factory for custom TypeORM repositories; receives
  `DataSource`, returns `Repository<Entity>`

### Injecting Repositories

```ts
import { Injectable } from '@nestjs/common';
import { InjectDynamicRepository } from '@concepta/rockets-repository';
import { TypeOrmRepository } from '@concepta/rockets-repository-typeorm';

@Injectable()
export class OrderService {
  constructor(
    @InjectDynamicRepository('orders')
    private readonly orderRepo: TypeOrmRepository<OrderEntity>,
  ) {}

  async findAll(): Promise<OrderEntity[]> {
    return this.orderRepo.find();
  }
}
```

## TypeOrmRepository

`TypeOrmRepository` extends `RepositoryAdapter` from
`@concepta/rockets-repository` and implements all abstract methods using
TypeORM. Every operation is transaction-aware, runs repository hooks,
and throws `RepositoryQueryException` on errors.

### Methods

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
| Utility | `prepare` | `(dto) => Entity \| undefined` |

All query and mutation methods accept an `options` parameter that includes
an optional `ctx` (repository context) for transaction and hook support.

### Transaction Awareness

When a `PlainLiteralObject` context with an active `trx` is provided,
`TypeOrmRepository` automatically:

1. Resolves the TypeORM transaction via `ctx.trx.getOrStart(transactionKey)`
2. Uses the transactional `EntityManager` for all operations
3. Marks the transaction as dirty on write operations

## WhereClause Translation

`TypeOrmRepository` translates the ORM-agnostic `WhereClause` AST from
`@concepta/rockets-repository` into TypeORM `FindOptionsWhere` objects.

### Supported Operators

| WhereOperator | TypeORM Translation | Description |
| --- | --- | --- |
| `eq` | `Equal(value)` | Equal |
| `ne` | `Not(Equal(value))` | Not equal |
| `gt` | `MoreThan(value)` | Greater than |
| `gte` | `MoreThanOrEqual(value)` | Greater than or equal |
| `lt` | `LessThan(value)` | Less than |
| `lte` | `LessThanOrEqual(value)` | Less than or equal |
| `contains` | `Like('%value%')` | Contains substring |
| `ncontains` | `Not(Like('%value%'))` | Does not contain substring |
| `starts` | `Like('value%')` | Starts with |
| `nstarts` | `Not(Like('value%'))` | Does not start with |
| `ends` | `Like('%value')` | Ends with |
| `nends` | `Not(Like('%value'))` | Does not end with |
| `in` | `In(values)` | In array |
| `nin` | `Not(In(values))` | Not in array |
| `null` | `IsNull()` | Is null |
| `nnull` | `Not(IsNull())` | Is not null |
| `between` | `Between(from, to)` | Between range |

### Compound Operators

| Operator | Description |
| --- | --- |
| `and` | All conditions must match |
| `or` | Any condition must match |

### Using the Where Builder

The `Where` helper from `@concepta/rockets-repository` builds `WhereClause`
objects that `TypeOrmRepository` translates automatically:

```ts
import { Where } from '@concepta/rockets-repository';

// Static API
const orders = await orderRepo.find(
  Where.where(
    Where.and(
      Where.eq<OrderEntity>('status', 'active'),
      Where.gt<OrderEntity>('total', 100),
    ),
  ),
);

// Typed builder API
const w = Where.for<OrderEntity>();
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
```

### Translation Process

1. The `WhereClause` AST is flattened into Disjunctive Normal Form (DNF)
   using `toDnf()` from `RepositoryAdapter`
2. Each AND-branch is translated to a TypeORM `FindOptionsWhere` object
3. Same-field conditions within a branch are merged using TypeORM `And()`
4. The resulting array of `FindOptionsWhere` objects represents the OR
   of all branches

## Transaction Support

This module provides `TypeOrmTransaction` and `TypeOrmTransactionFactory`
for integration with `@concepta/rockets-repository`'s transaction layer.

### TypeOrmTransaction

Wraps a TypeORM `QueryRunner` to manage transaction lifecycle:

```ts
const tx = new TypeOrmTransaction(dataSource);
await tx.start();

const manager = tx.getClient<EntityManager>();
await manager.save(entity);
tx.markDirty();

await tx.commit();
```

| Property / Method | Description |
| --- | --- |
| `isActive` | Whether the transaction is currently active |
| `isDirty` | Whether any write operations have occurred |
| `start()` | Create a QueryRunner and begin a transaction |
| `markDirty()` | Mark the transaction as dirty (write occurred) |
| `commit()` | Commit the transaction and release the QueryRunner |
| `rollback()` | Rollback the transaction and release the QueryRunner |
| `getClient<T>()` | Get the transactional `EntityManager` |

### TypeOrmTransactionFactory

Factory for creating `TypeOrmTransaction` instances. Automatically registered
with the `TransactionFactoryRegistry` when using `RepositoryModule.forFeature()`.

The transaction key follows the pattern `typeorm:<dataSourceName>` (e.g.,
`typeorm:default`).

### Automatic Transaction Integration

When `TypeOrmRepositoryModule` is used via `RepositoryModule.forFeature()`,
transaction factories are registered automatically. The `TypeOrmRepository`
joins transactions from the context:

```ts
import { TransactionScope } from '@concepta/rockets-repository';

@Injectable()
export class OrderService {
  constructor(
    private readonly txScope: TransactionScope,
    @InjectDynamicRepository('orders')
    private readonly orderRepo: TypeOrmRepository<OrderEntity>,
  ) {}

  async createOrder(ctx: PlainLiteralObject, dto: CreateOrderDto) {
    return this.txScope.run(ctx, async () => {
      // TypeOrmRepository automatically uses the transactional EntityManager
      return this.orderRepo.create(dto, { ctx });
    });
  }
}
```

## Repository Hooks

`TypeOrmRepository` runs repository hooks from `@concepta/rockets-repository`
at each operation lifecycle stage. Both high-level semantic hooks and
fine-grained hooks fire automatically.

| Operation | Before Hooks | After Hooks |
| --- | --- | --- |
| `find` | `beforeRead` -> `beforeFind` | `afterFind` -> `afterRead` |
| `findOne` | `beforeRead` -> `beforeFindOne` | `afterFindOne` -> `afterRead` |
| `count` | `beforeRead` -> `beforeCount` | `afterCount` |
| `findAndCount` | `beforeRead` -> `beforeFindAndCount` | `afterFindAndCount` |
| `create` | `beforeWrite` -> `beforeCreate` | `afterCreate` -> `afterWrite` |
| `createMany` | `beforeWrite` -> `beforeCreateMany` | `afterCreateMany` -> `afterWrite` |
| `update` | `beforeWrite` -> `beforeUpdate` | `afterUpdate` -> `afterWrite` |
| `upsert` | `beforeWrite` -> `beforeUpsert` | `afterUpsert` -> `afterWrite` |
| `replace` | `beforeWrite` -> `beforeReplace` | `afterReplace` -> `afterWrite` |
| `delete` | `beforeDestroy` -> `beforeDelete` | `afterDelete` -> `afterDestroy` |
| `deleteMany` | `beforeDestroy` -> `beforeDeleteMany` | `afterDeleteMany` -> `afterDestroy` |
| `softDelete` | `beforeTransition` -> `beforeSoftDelete` | `afterSoftDelete` -> `afterTransition` |
| `restore` | `beforeTransition` -> `beforeRestore` | `afterRestore` -> `afterTransition` |

Hooks are resolved via `HookResolverService` from `@concepta/rockets-app`.
The hook resolver is optional -- `TypeOrmRepository` works without it.

## Base Entities

The module provides abstract base entities for Postgres and SQLite with
audit fields and optimistic locking.

### Core Base Entities

| Entity | Database | Extends | Key Fields |
| --- | --- | --- | --- |
| `AuditPostgresEntity` | Postgres | -- | dateCreated, dateUpdated, dateDeleted (`timestamptz`), version |
| `AuditSqlLiteEntity` | SQLite | -- | dateCreated, dateUpdated, dateDeleted, version |
| `CommonPostgresEntity` | Postgres | `AuditPostgresEntity` | id (UUID primary key) |
| `CommonSqliteEntity` | SQLite | `AuditSqlLiteEntity` | id (UUID primary key) |

`AuditPostgresEntity` uses `@CreateDateColumn`, `@UpdateDateColumn`,
`@DeleteDateColumn` (for soft deletes), and `@VersionColumn` (for
optimistic locking). The Postgres variant uses `timestamptz` column types.

### Using Base Entities

```ts
import { Entity, Column } from 'typeorm';
import { CommonPostgresEntity } from '@concepta/rockets-repository-typeorm';

@Entity()
export class OrderEntity extends CommonPostgresEntity {
  @Column()
  status!: string;

  @Column('uuid')
  customerId!: string;
}
```

This gives `OrderEntity` the `id`, `dateCreated`, `dateUpdated`,
`dateDeleted`, and `version` fields automatically.

### Domain-Specific Entities

The module exports pre-built entities for common domain models. Each has
Postgres and SQLite variants:

- Org: `OrgPostgresEntity`, `OrgSqliteEntity`
- Org Member: `OrgMemberPostgresEntity`, `OrgMemberSqliteEntity`
- Org Profile: `OrgProfilePostgresEntity`, `OrgProfileSqliteEntity`
- Report: `ReportPostgresEntity`, `ReportSqliteEntity`
- File: `FilePostgresEntity`, `FileSqliteEntity`

## Exceptions

| Exception | Description |
| --- | --- |
| `TypeOrmEntityNameException` | Entity name cannot be resolved from TypeORM repository metadata |
| `RepositoryQueryException` | Repository query error (wraps original error) |

## Entry Points

| Import Path | Contents |
| --- | --- |
| `@concepta/rockets-repository-typeorm` | `TypeOrmRepositoryModule`, `TypeOrmRepository`, `TypeOrmTransaction`, `TypeOrmTransactionFactory`, base entities (Postgres + SQLite), exceptions |
