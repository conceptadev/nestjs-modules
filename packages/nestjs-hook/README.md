# @concepta/nestjs-hook

Specification-based hook system for NestJS. Provides composable, type-safe
hooks with the Specification pattern for filtering when hooks apply. Designed
as an extensible foundation that other modules (like `@concepta/nestjs-repository`)
build on to define their own hook types and method decorators.

## Project

[![NPM Latest](https://img.shields.io/npm/v/@concepta/nestjs-hook)](https://www.npmjs.com/package/@concepta/nestjs-hook)
[![NPM Downloads](https://img.shields.io/npm/dw/@concepta/nestjs-hook)](https://www.npmjs.com/package/@concepta/nestjs-hook)
[![GH Last Commit](https://img.shields.io/github/last-commit/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets)
[![GH Contrib](https://img.shields.io/github/contributors/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets/graphs/contributors)
[![NestJS Dep](https://img.shields.io/github/package-json/dependency-version/conceptadev/rockets/@nestjs/common?label=NestJS&logo=nestjs&filename=packages%2Fnestjs-core%2Fpackage.json)](https://www.npmjs.com/package/@nestjs/common)

## Table of Contents

- [Installation](#installation)
- [Module Registration](#module-registration)
- [Architecture Overview](#architecture-overview)
- [Defining Hooks](#defining-hooks)
- [UseHooks Decorator](#usehooks-decorator)
- [Specifications](#specifications)
- [HookInterceptor](#hookinterceptor)
- [HookResolverService](#hookresolverservice)
- [Extending for Other Modules](#extending-for-other-modules)

## Installation

```sh
yarn add @concepta/nestjs-hook
```

### Dependencies

| Package | Notes |
| --- | --- |
| `@concepta/nestjs-common` | Core interfaces (`SpecificationInterface`, `HookContextInterface`, etc.) |
| `@nestjs/common` | NestJS core |
| `@nestjs/core` | Reflector, ModuleRef, MetadataScanner |
| `rxjs` | Used by interceptor |

### Peer Dependencies

| Package | Required | Notes |
| --- | --- | --- |
| `rxjs` | Yes | Observable support for interceptor |

## Module Registration

### forRoot

`forRoot()` registers the module **globally** and sets up the hook
infrastructure.

```ts
import { HookModule } from '@concepta/nestjs-hook';

@Module({
  imports: [HookModule.forRoot({})],
  providers: [TenantHook, AuditHook],
})
export class AppModule {}
```

- Module is `@Global()` -- registered once for the entire application
- Automatically registers `HookInterceptor` as a global `APP_INTERCEPTOR`
- Provides `HookResolverService` globally for subsystem consumption
- Hook classes must be registered as providers in your application modules

## Architecture Overview

```text
@UseHooks(TenantHook)            <-- Controller/method decorator
         |
   HookInterceptor               <-- Gathers hooks, attaches to request ctx
         |
   HookResolverService.execute() <-- Called by subsystems (repository, etc.)
         |
   @Hook({ type: ... })          <-- Hook class with method decorators
     @BeforeFind()               <-- Hook method (subsystem-defined)
     @AfterCreate()
```

- **HookInterceptor** gathers hook configurations from `@UseHooks`
  decorators and attaches them to the request context
- **HookResolverService** is called by subsystems to execute hooks for a
  specific type and method key
- **Specifications** filter which hooks apply at runtime, evaluated against
  the request context
- **Method mappings** are pre-computed at decoration time (app startup) for
  O(1) runtime lookup

## Defining Hooks

### @Hook Decorator

Marks a class as a hook. Automatically applies `@Injectable()` so the class
can be resolved via DI.

```ts
import { Hook } from '@concepta/nestjs-hook';

@Hook({ type: MyHookType })
export class TenantHook {
  // methods decorated with hook method decorators
}

// With class-level specification
@Hook({ type: MyHookType, spec: Spec.always() })
export class AuditHook {
  // ...
}
```

At decoration time, `@Hook()` scans the class prototype and pre-computes a
map of method keys to handler methods. This avoids reflection during request
handling.

### Hook Method Decorators

Hook method decorators are created via the `createHookMethodDecorator()`
factory. Subsystems define their own method keys and decorators (see
[Extending for Other Modules](#extending-for-other-modules)).

```ts
import { createHookMethodDecorator } from '@concepta/nestjs-hook';

// Subsystem defines its own decorators
export const BeforeProcess = createHookMethodDecorator('beforeProcess');
export const AfterProcess = createHookMethodDecorator('afterProcess');

// Use in a hook class
@Hook({ type: MyHookType })
export class ValidationHook {
  @BeforeProcess()
  validate(payload, ctx) {
    // Modify or validate payload before processing
    return { ...payload, validated: true };
  }

  @AfterProcess()
  log(result, ctx) {
    // React to processing result
    return result;
  }
}
```

Multiple decorators can be stacked on the same method:

```ts
@BeforeFind()
@BeforeFindOne()
addTenantFilter(options, ctx) {
  return { ...options, where: { ...options.where, tenantId: ctx.tenantId } };
}
```

Each decorator accepts an optional `SpecificationInterface` to override the
class/method-level spec for that specific hook:

```ts
@BeforeDelete(Spec.and(isAdminSpec, isOwnerSpec))
restrictDelete(entity, ctx) {
  return entity;
}
```

## UseHooks Decorator

`@UseHooks()` specifies which hooks apply to a controller or route. The
global `HookInterceptor` reads this metadata and attaches the hooks to the
request context.

### Class-Level

Applies to all methods in the controller:

```ts
import { UseHooks } from '@concepta/nestjs-hook';

@UseHooks(TenantHook, AuditHook)
@Controller('users')
export class UserController {
  @Get()
  findAll() { /* TenantHook and AuditHook apply */ }

  @Post()
  create() { /* TenantHook and AuditHook apply */ }
}
```

### Method-Level

Adds to class-level hooks (merged, not replaced):

```ts
@UseHooks(TenantHook)
@Controller('users')
export class UserController {
  @Get()
  findAll() { /* Only TenantHook (from class) */ }

  @UseHooks(AdminHook)
  @Delete(':id')
  delete() { /* TenantHook + AdminHook */ }
}
```

### With Specification Overrides

Pass `{ hook, spec }` objects to override the hook's built-in spec for a
specific controller or route:

```ts
@UseHooks(
  { hook: TenantHook, spec: myCustomSpec },
  { hook: AuditHook, spec: Spec.always() },
)
@Controller('orders')
export class OrderController { /* ... */ }
```

## Specifications

Specifications implement the Specification pattern from Domain-Driven Design.
They encapsulate business rules as reusable, composable objects that determine
when a hook applies.

### Built-In Specifications

```ts
import { Spec } from '@concepta/nestjs-hook';

Spec.always()           // Always matches (default when no spec is provided)
Spec.never()            // Never matches (useful for temporarily disabling)
Spec.and(spec1, spec2)  // Both must be satisfied
Spec.or(spec1, spec2)   // Either can be satisfied
Spec.not(spec)          // Negation
```

Compose freely:

```ts
Spec.and(
  Spec.or(isAdminSpec, isOwnerSpec),
  Spec.not(isReadOnlySpec),
)
```

### Custom Specifications

Extend `CompositeSpecification<Ctx>` and implement `isSatisfiedBy()`:

```ts
import { CompositeSpecification } from '@concepta/nestjs-hook';

class EntitySpec extends CompositeSpecification {
  constructor(private readonly entityName: string) {
    super();
  }

  isSatisfiedBy(context: { entity?: string }): boolean {
    return context.entity === this.entityName;
  }
}

// Usage
@Hook({ type: MyHookType, spec: new EntitySpec('User') })
export class UserOnlyHook {
  @AfterCreate()
  notifyUserCreated(result, ctx) {
    return result;
  }
}
```

### Resolution Priority

When multiple specifications are defined at different levels, the most
specific one wins:

| Priority | Source | Example |
| --- | --- | --- |
| 1 (highest) | Hook method decorator param | `@BeforeFind(spec)` |
| 2 | `@Specification()` on the method | `@Specification(spec)` |
| 3 | `@Specification()` on the class or `@Hook({ spec })` | Class-level spec |
| 4 (default) | None provided | `Spec.always()` |

## HookInterceptor

`HookInterceptor` is registered globally by `HookModule.forRoot()`. It runs
on every HTTP request and:

1. Gets the app context from the request
2. Skips processing if hooks are already attached (idempotent)
3. Reads `@UseHooks` metadata from both the controller class and method,
   merging them
4. Normalizes each hook option (extracting the hook type from `@Hook`
   metadata)
5. Registers the hooks array on the request context

The interceptor bridges the decorator layer (`@UseHooks`) with the runtime
layer (`HookResolverService`).

### Custom Interceptor

If the global interceptor doesn't suit your needs (e.g., for non-HTTP
transports or custom context setup), you can build your own:

```ts
import { Injectable, NestInterceptor, CallHandler, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { HookOption, HookContextInterface, getAppContext } from '@concepta/nestjs-common';

@Injectable()
export class CustomHookInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const ctx = getAppContext<HookContextInterface>(request);

    if (ctx.has('hooks')) {
      return next.handle();
    }

    // Gather hooks from @UseHooks metadata
    const hooks = this.reflector.getAllAndMerge<HookOption[]>(
      'NESTJS_HOOK_HOOKS',
      [context.getHandler(), context.getClass()],
    );

    // Attach to context for downstream consumption
    ctx.register('hooks', hooks);

    return next.handle();
  }
}
```

## HookResolverService

`HookResolverService` executes hooks for a specific subsystem and method key.
Subsystems call this service directly -- it is not called automatically.

```ts
async execute<T>(
  hookType: { readonly KEY: string },
  methodKey: HookMethodKeyType,
  payload: T,
  ctx: HookContextInterface | undefined,
): Promise<T>
```

### Execution Flow

1. Returns payload immediately if `ctx.hooks` is empty
2. Filters hooks by `hookType.KEY` (only hooks of the requested subsystem)
3. Resolves hook instances via NestJS DI (`ModuleRef.get()`)
4. Reads pre-computed method mappings from cache metadata
5. For each matching method, evaluates the pre-resolved specification
   against the context
6. Calls hook methods in sequence, threading the payload through each
7. Only updates the payload if a hook method returns a defined value

### Usage by Subsystems

```ts
@Injectable()
export class MyService {
  constructor(private readonly hookResolver: HookResolverService) {}

  async process(data: ProcessData, ctx: HookContextInterface) {
    // Run "before" hooks
    const processedData = await this.hookResolver.execute(
      MyHookType,       // hook type (filters by KEY)
      'beforeProcess',  // method key
      data,             // payload threaded through hooks
      ctx,              // request context carrying hooks array
    );

    // Do the actual work
    const result = await this.doWork(processedData);

    // Run "after" hooks
    return this.hookResolver.execute(
      MyHookType,
      'afterProcess',
      result,
      ctx,
    );
  }
}
```

## Extending for Other Modules

The hook module is designed as infrastructure that other modules build on.
Each subsystem defines its own hook type, method keys, and decorators. This
section shows the full pattern using `@concepta/nestjs-repository` as a
real-world example.

### Step 1: Define a Hook Type

Create a function that doubles as both a class decorator and a type identifier:

```ts
import { SpecificationInterface } from '@concepta/nestjs-common';
import { Hook, HookTypeInterface } from '@concepta/nestjs-hook';

export function RepoHook(spec?: SpecificationInterface): ClassDecorator {
  return Hook({ type: RepoHook, spec });
}

// KEY is used by HookResolverService to filter hooks by subsystem
RepoHook.KEY = 'RepositoryHook';
Object.freeze(RepoHook);

// Optional type assertion
export const RepoHookType: HookTypeInterface = RepoHook;
```

### Step 2: Define Method Keys

```ts
export const RepoHookMethodKey = {
  BEFORE_FIND: 'beforeFind',
  AFTER_FIND: 'afterFind',
  BEFORE_CREATE: 'beforeCreate',
  AFTER_CREATE: 'afterCreate',
  BEFORE_UPDATE: 'beforeUpdate',
  AFTER_UPDATE: 'afterUpdate',
  BEFORE_DELETE: 'beforeDelete',
  AFTER_DELETE: 'afterDelete',
  // ... as many as your subsystem needs
} as const;
```

### Step 3: Create Method Decorators

```ts
import { createHookMethodDecorator } from '@concepta/nestjs-hook';

export const BeforeFind = createHookMethodDecorator(RepoHookMethodKey.BEFORE_FIND);
export const AfterFind = createHookMethodDecorator(RepoHookMethodKey.AFTER_FIND);
export const BeforeCreate = createHookMethodDecorator(RepoHookMethodKey.BEFORE_CREATE);
export const AfterCreate = createHookMethodDecorator(RepoHookMethodKey.AFTER_CREATE);
// ...
```

### Step 4: Call HookResolverService

In your subsystem's service or adapter, call `execute()` at the appropriate
lifecycle points:

```ts
import { HookResolverService } from '@concepta/nestjs-hook';

class RepositoryAdapter {
  constructor(private readonly hookResolver?: HookResolverService) {}

  async find(options, ctx) {
    // Run "before" hooks (may modify options)
    const hookedOptions = await this.hookResolver?.execute(
      RepoHook,
      RepoHookMethodKey.BEFORE_FIND,
      options,
      ctx,
    ) ?? options;

    // Perform the actual query
    const results = await this.driver.find(hookedOptions);

    // Run "after" hooks (may modify results)
    return this.hookResolver?.execute(
      RepoHook,
      RepoHookMethodKey.AFTER_FIND,
      results,
      ctx,
    ) ?? results;
  }
}
```

### Full Custom Subsystem Example

Here is a complete example creating a "Notification" hook subsystem from
scratch:

```ts
// notification-hook.decorators.ts
import { SpecificationInterface } from '@concepta/nestjs-common';
import { Hook, HookTypeInterface, createHookMethodDecorator } from '@concepta/nestjs-hook';

// Step 1: Hook type
export function NotificationHook(spec?: SpecificationInterface): ClassDecorator {
  return Hook({ type: NotificationHook, spec });
}
NotificationHook.KEY = 'NotificationHook';
Object.freeze(NotificationHook);

// Step 2: Method keys
export const NotificationHookMethodKey = {
  BEFORE_SEND: 'beforeSend',
  AFTER_SEND: 'afterSend',
  BEFORE_TEMPLATE: 'beforeTemplate',
  AFTER_TEMPLATE: 'afterTemplate',
} as const;

// Step 3: Method decorators
export const BeforeSend = createHookMethodDecorator(NotificationHookMethodKey.BEFORE_SEND);
export const AfterSend = createHookMethodDecorator(NotificationHookMethodKey.AFTER_SEND);
export const BeforeTemplate = createHookMethodDecorator(NotificationHookMethodKey.BEFORE_TEMPLATE);
export const AfterTemplate = createHookMethodDecorator(NotificationHookMethodKey.AFTER_TEMPLATE);
```

```ts
// notification.service.ts
import { Injectable } from '@nestjs/common';
import { HookResolverService } from '@concepta/nestjs-hook';
import { NotificationHook, NotificationHookMethodKey } from './notification-hook.decorators';

@Injectable()
export class NotificationService {
  constructor(private readonly hookResolver: HookResolverService) {}

  async send(notification, ctx) {
    const hooked = await this.hookResolver.execute(
      NotificationHook,
      NotificationHookMethodKey.BEFORE_SEND,
      notification,
      ctx,
    );

    const result = await this.deliver(hooked);

    return this.hookResolver.execute(
      NotificationHook,
      NotificationHookMethodKey.AFTER_SEND,
      result,
      ctx,
    );
  }
}
```

```ts
// sms-notification.hook.ts
import { Spec, CompositeSpecification } from '@concepta/nestjs-hook';
import { NotificationHook, BeforeSend, AfterSend } from './notification-hook.decorators';

class IsSmsSpec extends CompositeSpecification {
  isSatisfiedBy(ctx: { channel?: string }): boolean {
    return ctx.channel === 'sms';
  }
}

@NotificationHook(new IsSmsSpec())
export class SmsNotificationHook {
  @BeforeSend()
  formatForSms(notification, ctx) {
    return { ...notification, body: notification.body.slice(0, 160) };
  }

  @AfterSend()
  logDelivery(result, ctx) {
    // Log SMS delivery status
    return result;
  }
}
```

```ts
// notification.controller.ts
import { UseHooks } from '@concepta/nestjs-hook';

@UseHooks(SmsNotificationHook)
@Controller('notifications')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  async send(@Body() dto) {
    return this.notificationService.send(dto, ctx);
  }
}
```

This pattern allows any module to create its own hook subsystem with
type-safe decorators, specification-based filtering, and full DI support --
all built on the same underlying infrastructure.
