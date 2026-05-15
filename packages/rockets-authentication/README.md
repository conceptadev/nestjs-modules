# @concepta/rockets-authentication

[![NPM Latest](https://img.shields.io/npm/v/@concepta/rockets-authentication)](https://www.npmjs.com/package/@concepta/rockets-authentication)
[![NPM Downloads](https://img.shields.io/npm/dw/@conceptadev/rockets-authentication)](https://www.npmjs.com/package/@concepta/rockets-authentication)
[![GH Last Commit](https://img.shields.io/github/last-commit/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets)
[![GH Contrib](https://img.shields.io/github/contributors/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets/graphs/contributors)
[![NestJS Dep](https://img.shields.io/github/package-json/dependency-version/conceptadev/rockets/@nestjs/common?label=NestJS&logo=nestjs&filename=packages%2Fnestjs-core%2Fpackage.json)](https://www.npmjs.com/package/@nestjs/common)

Comprehensive NestJS authentication module built on CQRS and clean architecture.
Includes local (username/password), JWT bearer, refresh token, password recovery,
email verification, and OAuth provider routing — all in a single, unified module.

## Table of Contents

- [Overview](#overview)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [End-to-End Example](#end-to-end-example)
- [Features](#features)
  - [JWT Bearer Authentication](#jwt-bearer-authentication)
  - [Local (Username/Password) Login](#local-usernamepassword-login)
  - [Refresh Tokens](#refresh-tokens)
  - [Password Recovery](#password-recovery)
  - [Email Verification](#email-verification)
  - [OAuth Provider Router](#oauth-provider-router)
- [Configuration Reference](#configuration-reference)
  - [Module Options](#module-options)
  - [JWT Settings](#jwt-settings)
  - [Strategy Settings](#strategy-settings)
  - [MFA Settings](#mfa-settings)
  - [Port Settings](#port-settings)
  - [Extras](#extras)
- [Advanced](#advanced)
  - [Two-Tier CQRS Architecture](#two-tier-cqrs-architecture)
  - [Custom Notification Commands](#custom-notification-commands)
  - [Disabling the Global Guard](#disabling-the-global-guard)
  - [Context Overlay](#context-overlay)
- [Exports Reference](#exports-reference)
- [Related Packages](#related-packages)

---

## Overview

`@concepta/rockets-authentication` consolidates six authentication features
into a single package:

| Feature | What it provides |
|---|---|
| **JWT** | Bearer token verification, global APP_GUARD, `@AuthPublic`/`@AuthUser` |
| **Local** | Username/password login via `passport-local` |
| **Refresh** | Refresh token issuance and rotation |
| **Recovery** | OTP-based password recovery (recover-login, recover-password, update-password) |
| **Verify** | OTP-based email/account verification |
| **Router** | `?provider=` query dispatch to named OAuth guards |

Internally the module is structured in three layers:

- **Domain** — aggregates, ports, policies, events, exceptions; zero framework
  dependencies.
- **Application** — CQRS command/query handlers that orchestrate the domain.
- **Infrastructure** — Passport strategies, JWT service, DTOs, config,
  the `AuthUserContextOverlay` gateway.

OAuth provider strategies (Apple, GitHub, Google) live in separate packages
(`@concepta/nestjs-auth-apple`, `-github`, `-google`). This module provides
the `AuthRouterGuard` dispatcher that routes to them and the OAuth utility
types they depend on.

---

## Installation

```bash
yarn add @concepta/rockets-authentication
```

Peer dependencies:

```bash
yarn add class-transformer class-validator rxjs
```

---

## Quick Start

The minimal setup — JWT verification only, no local login, no MFA — requires
only `settings.jwt`:

```typescript
import { AuthenticationModule } from '@concepta/rockets-authentication';

@Module({
  imports: [
    AuthenticationModule.forRoot({
      settings: {
        jwt: {
          access: {
            secret: process.env.JWT_ACCESS_SECRET,
            signOptions: { expiresIn: '15m' },
          },
          refresh: {
            secret: process.env.JWT_REFRESH_SECRET,
            signOptions: { expiresIn: '7d' },
          },
        },
        strategies: {
          jwt: {},      // activates JwtStrategy + global APP_GUARD
        },
      },
    }),
  ],
})
export class AppModule {}
```

All routes are protected by default. Mark public routes with `@AuthPublic()`:

```typescript
import { AuthPublic } from '@concepta/rockets-authentication';

@AuthPublic()
@Controller('health')
export class HealthController {
  @Get()
  check() { return 'ok'; }
}
```

Activate additional features by adding keys to `settings.strategies` and
`settings.mfa` and supplying the corresponding `ports.*` settings. See the
[Configuration Reference](#configuration-reference) and the
[End-to-End Example](#end-to-end-example) below.

---

## End-to-End Example

This example wires up local login and JWT bearer auth. The scenario:

- `POST /auth/login` — accepts `username`/`password`, returns
  `accessToken` + `refreshToken`.
- `GET /me` — returns the authenticated user (protected by the global JWT guard).

### Step 1 — Implement UserPort queries and handlers

The module needs to look up users by id, subject (JWT sub), username, and
email. You provide CQRS Query/Command classes that implement the port interfaces.

```typescript
// src/user/queries/get-user-by-username.query.ts
import { PlainLiteralObject } from '@nestjs/common';
import { Query } from '@nestjs/cqrs';
import {
  AuthenticationUserResult,
  GetUserByUsernameQueryInterface,
} from '@concepta/rockets-authentication';

export class GetUserByUsernameQuery
  extends Query<AuthenticationUserResult>
  implements GetUserByUsernameQueryInterface
{
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly username: string,
  ) {
    super();
  }
}
```

```typescript
// src/user/queries/get-user-by-username.handler.ts
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthenticationUserResult } from '@concepta/rockets-authentication';
import { GetUserByUsernameQuery } from './get-user-by-username.query';
import { UserEntity } from '../user.entity';

@QueryHandler(GetUserByUsernameQuery)
export class GetUserByUsernameHandler
  implements IQueryHandler<GetUserByUsernameQuery>
{
  constructor(
    @InjectRepository(UserEntity)
    private readonly repo: Repository<UserEntity>,
  ) {}

  async execute(query: GetUserByUsernameQuery): Promise<AuthenticationUserResult> {
    return this.repo.findOne({ where: { username: query.username } });
  }
}
```

Repeat this pattern for `GetUserByIdQuery`, `GetUserBySubjectQuery`,
`GetUserByEmailQuery`, and `UpdateUserCommand` — each implementing the
corresponding interface exported from `@concepta/rockets-authentication`.

### Step 2 — Implement PasswordPort commands

```typescript
// src/user/commands/validate-password.command.ts
import { PlainLiteralObject } from '@nestjs/common';
import { Command } from '@nestjs/cqrs';
import {
  ValidatePasswordCommandInterface,
} from '@concepta/rockets-authentication';
import { ReferenceIdInterface } from '@concepta/rockets-app';

export class ValidatePasswordCommand
  extends Command<boolean>
  implements ValidatePasswordCommandInterface
{
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly password: string,
    public readonly target: ReferenceIdInterface,
  ) {
    super();
  }
}
```

```typescript
// src/user/commands/validate-password.handler.ts
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PasswordModule } from '@concepta/rockets-password';
import { ValidatePasswordCommand } from './validate-password.command';
import { UserRepository } from '../user.repository';

@CommandHandler(ValidatePasswordCommand)
export class ValidatePasswordHandler
  implements ICommandHandler<ValidatePasswordCommand>
{
  constructor(
    private readonly userRepo: UserRepository,
    private readonly passwordService: PasswordModule,
  ) {}

  async execute(command: ValidatePasswordCommand): Promise<boolean> {
    const user = await this.userRepo.findById(command.target.id);
    if (!user) return false;
    return this.passwordService.validateObject(command.password, user);
  }
}
```

Provide `SetPasswordCommand` in the same way (implementing
`SetPasswordCommandInterface`).

### Step 3 — Wire up the module

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import {
  AuthenticationModule,
  IssueAccessTokenCommand,
  IssueRefreshTokenCommand,
  ValidateTokenQuery,
  ValidateAndVerifyAccessTokenQuery,
  ValidateAndVerifyRefreshTokenQuery,
  VerifyAccessTokenQuery,
  VerifyRefreshTokenQuery,
} from '@concepta/rockets-authentication';

import { GetUserByIdQuery } from './user/queries/get-user-by-id.query';
import { GetUserBySubjectQuery } from './user/queries/get-user-by-subject.query';
import { GetUserByUsernameQuery } from './user/queries/get-user-by-username.query';
import { GetUserByEmailQuery } from './user/queries/get-user-by-email.query';
import { UpdateUserCommand } from './user/commands/update-user.command';
import { ValidatePasswordCommand } from './user/commands/validate-password.command';
import { SetPasswordCommand } from './user/commands/set-password.command';
import { userQueryHandlers, userCommandHandlers } from './user/user.handlers';
import { passwordHandlers } from './user/password.handlers';

@Module({
  imports: [
    CqrsModule,
    AuthenticationModule.forRoot({
      settings: {
        jwt: {
          access: {
            secret: process.env.JWT_ACCESS_SECRET,
            signOptions: { expiresIn: '15m' },
          },
          refresh: {
            secret: process.env.JWT_REFRESH_SECRET,
            signOptions: { expiresIn: '7d' },
          },
        },
        strategies: {
          jwt: {},      // enable JwtStrategy + global APP_GUARD
          local: {},    // enable LocalStrategy
          refresh: {},  // enable RefreshStrategy
        },
      },
      ports: {
        user: {
          getByIdQuery: GetUserByIdQuery,
          getBySubjectQuery: GetUserBySubjectQuery,
          getByUsernameQuery: GetUserByUsernameQuery,
          getByEmailQuery: GetUserByEmailQuery,
          updateCommand: UpdateUserCommand,
        },
        password: {
          validateCommand: ValidatePasswordCommand,
          setPasswordCommand: SetPasswordCommand,
        },
        // otp, recoveryNotification, verifyNotification are required
        // when ports is provided — supply stubs or real implementations
        // depending on whether you enable settings.mfa.recovery / .verify
        otp: { ... },
        recoveryNotification: { ... },
        verifyNotification: { ... },
      },
    }),
  ],
  providers: [
    ...userQueryHandlers,
    ...userCommandHandlers,
    ...passwordHandlers,
  ],
})
export class AppModule {}
```

### Step 4 — Add a login controller

`LocalStrategy` calls `LocalService.validate()` which invokes `UserPort` and
`PasswordPort`. The result is placed on `request.user`. Your controller issues
tokens using `TokenPort`:

```typescript
// src/auth/auth.controller.ts
import { Controller, Post, Req, Get } from '@nestjs/common';
import { Request } from 'express';
import { AuthPublic, AuthUser, LocalGuard, RefreshGuard } from '@concepta/rockets-authentication';
import { UseGuards } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @AuthPublic()
  @UseGuards(LocalGuard)
  @Post('login')
  async login(@Req() req: Request) {
    // LocalStrategy populates req.user with AuthenticatedResponseInterface
    return req.user;
  }

  @AuthPublic()
  @UseGuards(RefreshGuard)
  @Post('refresh')
  async refresh(@Req() req: Request) {
    return req.user;
  }
}

@Controller('me')
export class MeController {
  @Get()
  profile(@AuthUser() user: unknown) {
    return user;
  }
}
```

### Step 5 — Test with curl

```bash
# Obtain tokens
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "alice", "password": "s3cr3t"}'
# => { "accessToken": "eyJ...", "refreshToken": "eyJ..." }

# Access a protected route
curl -X GET http://localhost:3000/me \
  -H "Authorization: Bearer eyJ..."

# Refresh tokens
curl -X POST http://localhost:3000/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "eyJ..."}'
```

---

## Features

### JWT Bearer Authentication

Activated by setting `settings.strategies.jwt`. Registers a global `APP_GUARD`
that enforces JWT verification on every route. Token extraction defaults to
`Authorization: Bearer <token>`.

**Decorators:**

- `@AuthPublic()` — exempts a controller or route handler from the global guard.
- `@AuthUser()` — injects the verified user object into a route parameter.

```typescript
import { AuthPublic, AuthUser } from '@concepta/rockets-authentication';

@Controller('public')
export class PublicController {
  @AuthPublic()
  @Get()
  open() { return 'no token needed'; }
}

@Controller('private')
export class PrivateController {
  @Get('me')
  whoAmI(@AuthUser() user: unknown) {
    return user;
  }
}
```

**Guards exported:**

- `JwtGuard` — `AuthGuard('jwt')` subclass with `canDisable` support.
- `AuthGuard` — base factory function; use to build custom guards:
  `AuthGuard(strategyName, options?)`.

**Custom token extraction:**

Configure `settings.strategies.jwt` with `jwtFromRequest` (a
`JwtFromRequestFunction` from `passport-jwt`) to change how tokens are
extracted. `ExtractJwt` is re-exported for convenience:

```typescript
import { ExtractJwt } from '@concepta/rockets-authentication';

settings: {
  strategies: {
    jwt: {
      jwtFromRequest: ExtractJwt.fromUrlQueryParameter('token'),
    },
  },
}
```

---

### Local (Username/Password) Login

Activated by setting `settings.strategies.local`. Registers a `passport-local`
strategy. On each login request the strategy:

1. Calls `UserPort.getByUsername()` to find the user.
2. Calls `PasswordPort.validate()` to verify the password.
3. Calls `TokenPort.issueAccessToken()` and `TokenPort.issueRefreshToken()` to
   build the response.

**Exported symbols:** `LocalGuard`, `LocalService`, `LocalLoginDto`,
`LocalCredentialsInterface`, `LocalServiceInterface`,
`LocalValidateUserInterface`.

**Customize field names:**

```typescript
settings: {
  strategies: {
    local: {
      usernameField: 'email',   // default: 'username'
      passwordField: 'pass',    // default: 'password'
      loginDto: MyLoginDto,     // optional custom DTO class for validation
    },
  },
}
```

**Exceptions:** `LocalUnauthorizedException`, `LocalUsernameNotFoundException`,
`LocalUserInactiveException`, `LocalInvalidPasswordException`,
`LocalInvalidLoginDataException`, `LocalInvalidCredentialsException`.

---

### Refresh Tokens

Activated by setting `settings.strategies.refresh`. Registers a Passport
strategy that reads a refresh token from the request body (`refreshToken`
field by default) and issues a new access + refresh token pair.

**Exported symbols:** `RefreshGuard`, `RefreshDto`.

**Custom token extraction:**

```typescript
import { ExtractJwt } from '@concepta/rockets-authentication';

settings: {
  strategies: {
    refresh: {
      jwtFromRequest: ExtractJwt.fromBodyField('token'),
    },
  },
}
```

**Exceptions:** `RefreshException`, `RefreshUnauthorizedException`.

---

### Password Recovery

Activated by setting `settings.mfa.recovery`. Provides the following flows,
all requiring `ports.otp` and `ports.recoveryNotification`:

| Flow | Description |
|---|---|
| Recover login | Sends the user's username to their email |
| Recover password | Generates an OTP passcode and sends it by email |
| Validate passcode | Validates the OTP passcode |
| Update password | Sets a new password and notifies the user |

**Exported symbols:** `RecoveryService`, `RecoveryRecoverLoginDto`,
`RecoveryRecoverPasswordDto`, `RecoveryUpdatePasswordDto`,
`RecoveryValidatePasscodeDto`, `RecoveryException`, `RecoveryOtpInvalidException`.

**OTP settings:**

```typescript
settings: {
  mfa: {
    recovery: {
      otp: {
        category: 'auth',
        namespace: 'recovery',
        type: 'uuid',
        expiresIn: '1h',
        rateSeconds: 60,    // min seconds between requests per user
        rateThreshold: 5,   // max requests within rateSeconds window
      },
    },
  },
}
```

**Notification dispatch:** Recovery events are dispatched fire-and-forget via
`RecoveryNotificationPort`, which calls `CommandBus.execute()` with the command
class you provide in `ports.recoveryNotification`. Register a `@CommandHandler`
for each command class in your application module:

```typescript
ports: {
  recoveryNotification: {
    sendRecoverLoginNotificationCommand: SendRecoverLoginCommand,
    sendRecoverPasswordNotificationCommand: SendRecoverPasswordCommand,
    sendPasswordUpdatedNotificationCommand: SendPasswordUpdatedCommand,
  },
}
```

Each command receives `(ctx, email, ...params)` — see
`SendRecoverLoginNotificationCommandInterface`,
`SendRecoverPasswordNotificationCommandInterface`, and
`SendPasswordUpdatedNotificationCommandInterface` for the exact shapes.

---

### Email Verification

Activated by setting `settings.mfa.verify`. Provides OTP-based email
verification using two endpoints — send and confirm — and toggles the user's
`active` flag on successful confirmation.

**Exported symbols:** `VerifyService`, `VerifyDto`, `VerifyUpdateDto`,
`VerifySendParamsInterface`, `VerifyConfirmParamsInterface`,
`VerifyException`, `VerifyOtpInvalidException`.

**OTP settings** (same shape as recovery):

```typescript
settings: {
  mfa: {
    verify: {
      otp: {
        category: 'auth',
        namespace: 'verify',
        type: 'uuid',
        expiresIn: '24h',
        rateSeconds: 300,
        rateThreshold: 3,
      },
    },
  },
}
```

**Notification dispatch:** `VerifyNotificationPort` fires
`sendVerifyNotificationCommand` via the command bus. The command receives
`(ctx, email, passcode, tokenExp)` — see `SendVerifyNotificationCommandInterface`:

```typescript
ports: {
  verifyNotification: {
    sendVerifyNotificationCommand: SendVerifyCommand,
  },
}
```

---

### OAuth Provider Router

`AuthRouterGuard` dispatches auth requests to named provider guards based on
the `?provider=` query parameter. It does not implement any OAuth strategy
itself — the strategies live in downstream provider packages.

**Login flow:**

```
GET /auth/login?provider=google   →   AuthRouterGuard   →   AuthGoogleGuard
```

**Callback flow** (OAuth `code` + `state`):

```
GET /auth/callback?code=xxx&state={"provider":"google"}
  →   AuthRouterGuard (extracts provider from state JSON)
  →   AuthGoogleGuard
```

**Wiring provider guards:**

```typescript
import { AuthGoogleGuard } from '@concepta/nestjs-auth-google';

AuthenticationModule.forRoot({
  // ...settings + ports...
  guards: [
    { name: 'google', guard: new AuthGoogleGuard() },
    { name: 'github', guard: new AuthGithubGuard() },
  ],
})
```

The `AuthRouterGuard` is exported and can be applied to any controller:

```typescript
import { AuthRouterGuard, AuthPublic } from '@concepta/rockets-authentication';

@AuthPublic()
@UseGuards(AuthRouterGuard)
@Get('login')
async login() {}

@AuthPublic()
@UseGuards(AuthRouterGuard)
@Get('callback')
async callback(@Req() req: Request) {
  return req.user;
}
```

**OAuth utility types** (used by provider packages, re-exported here):
`OAuthAuthenticateOptionsInterface`, `OAuthParamsInterface`,
`OAuthRequestInterface`, `processOAuthParams`.

**Router exceptions:**

| Class | When thrown |
|---|---|
| `AuthRouterProviderMissingException` | `?provider` query param absent and no `state.provider` |
| `AuthRouterProviderNotSupportedException` | Named provider not registered in `guards: []` |
| `AuthRouterConfigNotAvailableException` | Guard registry not injected (misconfiguration) |
| `AuthRouterGuardInvalidException` | Registered guard lacks a `canActivate` method |
| `AuthRouterAuthenticationFailedException` | Provider guard throws a non-router exception |

---

## Configuration Reference

### Module Options

```typescript
AuthenticationModule.forRoot({
  settings?: AuthenticationSettingsInterface;
  ports?: AuthenticationPortsInterface;
  // extras (passed as the second arg to setExtras):
  global?: boolean;            // forRoot sets this to true automatically
  appGuard?: false | CanActivate;
  guards?: AuthRouterGuardConfigInterface[];
})
```

`forRoot` / `forRootAsync` set `global: true` (module available app-wide).
`register` / `registerAsync` do not — use these for feature-scoped auth.

### JWT Settings

Configured under `settings.jwt`. Both `access` and `refresh` accept
`TokenOptionsInterface`, which extends `JwtModuleOptions` from `@nestjs/jwt`.

```typescript
settings: {
  jwt: {
    access: {
      secret: process.env.JWT_ACCESS_SECRET,   // min 32 chars recommended
      signOptions: { expiresIn: '15m' },
    },
    refresh: {
      secret: process.env.JWT_REFRESH_SECRET,  // must differ from access secret
      signOptions: { expiresIn: '7d' },
    },
  },
}
```

Defaults when `expiresIn` is omitted: access = 1h, refresh = 24h. The module
emits `process.emitWarning` if secrets are too short, identical, or expiry is
not set. Use separate secrets for access and refresh tokens.

### Strategy Settings

Presence of a strategy key activates that Passport strategy:

```typescript
settings: {
  strategies: {
    jwt?: JwtStrategyPolicySettingsInterface;     // { jwtFromRequest? }
    local?: LocalStrategyPolicySettingsInterface; // { usernameField?, passwordField?, loginDto? }
    refresh?: RefreshStrategyPolicySettingsInterface; // { jwtFromRequest? }
  },
}
```

Omitting a strategy key entirely disables that strategy.

### MFA Settings

Presence of an MFA key activates that feature:

```typescript
settings: {
  mfa: {
    recovery?: RecoveryPolicySettingsInterface; // { otp: OtpPolicySettingsInterface }
    verify?: VerifyPolicySettingsInterface;     // { otp: OtpPolicySettingsInterface }
  },
}
```

`OtpPolicySettingsInterface`:

```typescript
{
  otp: {
    category: string;           // groups OTPs (e.g. 'auth')
    namespace: string;          // sub-groups OTPs (e.g. 'recovery')
    type: string;               // OTP type (e.g. 'uuid', 'numeric')
    expiresIn: string;          // e.g. '1h'
    duplicateStrategy?: 'ALLOW' | 'DEACTIVATE';
    rateSeconds?: number;       // 0 disables rate limiting (emits warning)
    rateThreshold?: number;     // 0 disables rate limiting (emits warning)
  }
}
```

### Port Settings

Ports connect the module's domain layer to your application's CQRS handlers.
When `ports` is provided, all required fields must be supplied:

```typescript
ports: {
  jwt?: JwtPortSettings;                        // optional; defaults are used if omitted
  token: TokenPortSettings;                     // required
  user: UserPortSettings;                       // required
  password: PasswordPortSettings;               // required
  otp: OtpPortSettings;                         // required
  recoveryNotification: RecoveryNotificationPortSettings;  // required
  verifyNotification: VerifyNotificationPortSettings;       // required
}
```

Each setting object maps port methods to Command/Query constructor classes that
your application registers as CQRS handlers. See the
[End-to-End Example](#end-to-end-example) for a full wiring pattern.

**Built-in default commands/queries** (exported and reusable for `ports.token`):

| Symbol | Type |
|---|---|
| `IssueAccessTokenCommand` | `Command<string>` |
| `IssueRefreshTokenCommand` | `Command<string>` |
| `IssueAuthenticatedResponseCommand` | `Command<AuthenticatedResponseInterface>` |
| `VerifyAccessTokenQuery` | `Query<PlainLiteralObject>` |
| `VerifyRefreshTokenQuery` | `Query<PlainLiteralObject>` |
| `ValidateTokenQuery` | `Query<boolean>` |
| `ValidateAndVerifyAccessTokenQuery` | `Query<PlainLiteralObject>` |
| `ValidateAndVerifyRefreshTokenQuery` | `Query<PlainLiteralObject>` |

The built-in token handlers are always registered — point `ports.token` at
these classes if you do not need custom token-issuance logic.

### Extras

```typescript
AuthenticationModule.forRoot({
  // extras are passed directly alongside settings/ports:
  appGuard?: false | CanActivate;
  guards?: AuthRouterGuardConfigInterface[];
})
```

- `appGuard: false` — disables the global `APP_GUARD` entirely.
- `appGuard: MyCustomGuard` — replaces the default `JwtGuard` as the APP_GUARD.
- `guards` — registers named guards for `AuthRouterGuard` dispatch.

---

## Advanced

### Two-Tier CQRS Architecture

The module uses a two-tier CQRS chain for token operations:

```
TokenPort
  ↓ dispatches IssueAccessTokenCommand
  → IssueAccessTokenHandler
      ↓ calls JwtPort.signAccessToken()
      → JwtPort dispatches SignAccessTokenCommand
        → SignAccessTokenHandler
            ↓ calls JwtService.sign()
```

This means you can override at either tier:

- **Override at the JwtPort tier** — provide custom `ports.jwt` settings to
  swap out the signing/verification CQRS classes (affects raw JWT operations).
- **Override at the TokenPort tier** — provide custom `ports.token` settings to
  swap out how access/refresh tokens are issued and verified.

Default `JwtPort` settings use the built-in `SignAccessTokenCommand`,
`SignRefreshTokenCommand`, `JwtVerifyAccessTokenQuery`, and
`JwtVerifyRefreshTokenQuery`.

### Custom Notification Commands

Recovery and verify notifications are dispatched fire-and-forget. The module
provides the port interface contracts; you provide the handlers:

```typescript
import { Command } from '@nestjs/cqrs';
import {
  SendRecoverPasswordNotificationCommandInterface,
} from '@concepta/rockets-authentication';

export class SendRecoverPasswordCommand
  extends Command<void>
  implements SendRecoverPasswordNotificationCommandInterface
{
  constructor(
    public readonly ctx: PlainLiteralObject,
    public readonly email: string,
    public readonly passcode: string,
    public readonly tokenExp: Date,
  ) {
    super();
  }
}

@CommandHandler(SendRecoverPasswordCommand)
export class SendRecoverPasswordHandler
  implements ICommandHandler<SendRecoverPasswordCommand>
{
  constructor(private readonly mailer: MailerService) {}

  async execute(command: SendRecoverPasswordCommand): Promise<void> {
    await this.mailer.sendMail({
      to: command.email,
      template: 'recover-password',
      context: { passcode: command.passcode, expires: command.tokenExp },
    });
  }
}
```

### Disabling the Global Guard

To disable the global guard entirely:

```typescript
AuthenticationModule.forRoot({
  settings: { strategies: { jwt: {} } },
  appGuard: false,
})
```

To protect only specific routes, leave the global guard enabled and use
`@AuthPublic()` on controllers or handlers that should be publicly accessible.

To replace the default `JwtGuard` with a custom guard as the global APP_GUARD:

```typescript
import { JwtGuard } from '@concepta/rockets-authentication';

class MyAppGuard extends JwtGuard {
  // override canActivate or handleRequest
}

AuthenticationModule.forRoot({
  settings: { strategies: { jwt: {} } },
  appGuard: new MyAppGuard(),
})
```

### Context Overlay

`AuthUserContextOverlay` is registered as an `APP_INTERCEPTOR` and publishes
`request.user` into the Rockets `AppContextHost` via `AuthUserCtx`:

```typescript
import { AuthUserCtx } from '@concepta/rockets-authentication';
import { getAppContext } from '@concepta/rockets-app';

// In a handler or interceptor:
const ctx = getAppContext(request);
const { user } = ctx.with(AuthUserCtx);
```

This is useful in command/query handlers that need access to the authenticated
user without taking it as a parameter.

---

## Exports Reference

### Module and Registration

| Symbol | Description |
|---|---|
| `AuthenticationModule` | `forRoot`, `forRootAsync`, `register`, `registerAsync` |
| `AuthenticationOptions` | Synchronous options type |
| `AuthenticationAsyncOptions` | Async options type |

### Guards and Strategies

| Symbol | Description |
|---|---|
| `JwtGuard` | JWT bearer guard (`AuthGuard('jwt')`) |
| `LocalGuard` | Local strategy guard (`AuthGuard('local')`) |
| `RefreshGuard` | Refresh token guard (`AuthGuard('refresh')`) |
| `AuthRouterGuard` | OAuth provider dispatcher |
| `AuthGuard` | Guard factory function |
| `JwtStrategy` | `passport-jwt` strategy |
| `JwtPassportStrategy` | Low-level Passport JWT strategy base |
| `PassportStrategyFactory` | Factory for creating Passport strategies |

### Decorators

| Symbol | Description |
|---|---|
| `@AuthPublic()` | Exempts a route from the global JWT guard |
| `@AuthUser()` | Injects `request.user` into a route parameter |

### DTOs

| Symbol | Description |
|---|---|
| `AuthenticationResponseDto` | Access + refresh token response |
| `LocalLoginDto` | Default login DTO (`username`, `password`) |
| `RefreshDto` | Refresh token request body |
| `RecoveryRecoverLoginDto` | Recover-login request body |
| `RecoveryRecoverPasswordDto` | Recover-password request body |
| `RecoveryUpdatePasswordDto` | Update-password request body |
| `RecoveryValidatePasscodeDto` | Validate-passcode request body |
| `VerifyDto` | Verify send request body |
| `VerifyUpdateDto` | Verify confirm request body |

### Ports

| Symbol | Description |
|---|---|
| `JwtPort` | Sign/verify raw JWTs |
| `TokenPort` | Issue/verify/validate access and refresh tokens |
| `UserPort` | User lookup and update |
| `PasswordPort` | Password validation and set |
| `OtpPort` | OTP create/validate/clear |
| `RecoveryNotificationPort` | Recovery email dispatch |
| `VerifyNotificationPort` | Verify email dispatch |

### Policies

| Symbol | Description |
|---|---|
| `JwtPolicy` | JWT signing settings (access/refresh secrets, expiry) |
| `JwtStrategyPolicy` | JWT Passport strategy settings |
| `LocalStrategyPolicy` | Local strategy settings (fields, DTO) |
| `RefreshStrategyPolicy` | Refresh strategy settings |
| `GuardsPolicy` | Guard enable/disable settings |
| `RecoveryPolicy` | Recovery OTP settings |
| `VerifyPolicy` | Verify OTP settings |
| `OtpPolicy` | Base OTP policy |

### Aggregates and Events

| Symbol | Description |
|---|---|
| `Token` | Token lifecycle aggregate |
| `TokenIssuedEvent` | Emitted when a token is issued |
| `TokenRevokedEvent` | Emitted when a token is revoked |

### Exceptions

| Symbol | Description |
|---|---|
| `AuthenticationException` | Base domain exception |
| `AuthenticationEmailException` | Notification dispatch failure |
| `TokenException` | Base token exception |
| `TokenAlreadyRevokedException` | Token revoked twice |
| `AuthenticationAccessTokenException` | Access token error |
| `AuthenticationRefreshTokenException` | Refresh token error |
| `JwtException` | Base JWT exception |
| `JwtVerifyException` | JWT verification failure |
| `JwtAuthenticationException` | JWT auth failure |
| `JwtUnauthorizedException` | JWT strategy unauthorized |
| `LocalException` | Base local exception |
| `LocalUnauthorizedException` | Local strategy unauthorized |
| `LocalUsernameNotFoundException` | Username not found |
| `LocalUserInactiveException` | User is inactive |
| `LocalInvalidPasswordException` | Password mismatch |
| `LocalInvalidLoginDataException` | Malformed login data |
| `LocalInvalidCredentialsException` | Credentials rejected |
| `RefreshException` | Base refresh exception |
| `RefreshUnauthorizedException` | Refresh strategy unauthorized |
| `RecoveryException` | Base recovery exception |
| `RecoveryOtpInvalidException` | Recovery OTP invalid |
| `VerifyException` | Base verify exception |
| `VerifyOtpInvalidException` | Verify OTP invalid |
| `AuthRouterException` | Base router exception |
| `AuthRouterProviderMissingException` | Provider not specified |
| `AuthRouterProviderNotSupportedException` | Provider not registered |
| `AuthRouterConfigNotAvailableException` | Guard registry missing |
| `AuthRouterGuardInvalidException` | Guard lacks canActivate |
| `AuthRouterAuthenticationFailedException` | Provider guard failed |
| `AuthenticationUserPortRequiredException` | UserPort not configured |
| `AuthenticationFeatureConfigException` | Feature misconfiguration |

### Default CQRS Commands and Queries

| Symbol | Tier |
|---|---|
| `IssueAccessTokenCommand` | TokenPort |
| `IssueRefreshTokenCommand` | TokenPort |
| `IssueAuthenticatedResponseCommand` | TokenPort |
| `VerifyAccessTokenQuery` | TokenPort |
| `VerifyRefreshTokenQuery` | TokenPort |
| `ValidateTokenQuery` | TokenPort |
| `ValidateAndVerifyAccessTokenQuery` | TokenPort |
| `ValidateAndVerifyRefreshTokenQuery` | TokenPort |
| `SignAccessTokenCommand` | JwtPort |
| `SignRefreshTokenCommand` | JwtPort |
| `JwtVerifyAccessTokenQuery` | JwtPort |
| `JwtVerifyRefreshTokenQuery` | JwtPort |

### Context Overlay

| Symbol | Description |
|---|---|
| `AuthUserCtx` | `OverlayRef` for the authenticated user context |
| `AuthUserContextOverlay` | `APP_INTERCEPTOR` that publishes `request.user` |
| `AuthUserContextInterface` | Shape of the user context overlay |

### OAuth Utilities

| Symbol | Description |
|---|---|
| `processOAuthParams` | Extract and normalize OAuth callback params |
| `OAuthAuthenticateOptionsInterface` | Options passed to `passport.authenticate()` |
| `OAuthParamsInterface` | Normalized OAuth params (provider, state, code) |
| `OAuthRequestInterface` | Extended request with OAuth state |
| `ExtractJwt` | Re-export from `passport-jwt` |

---

## Related Packages

**Runtime dependencies:**

- [`@concepta/rockets-app`](../nestjs-common) — `AppContextHost`, `OverlayRef`,
  `ReferenceId`, event/exception base classes.
- [`@concepta/rockets-password`](../rockets-password) — password hashing and
  validation utilities (typically used in `PasswordPort` command handlers).
- [`@concepta/rockets-user`](../rockets-user) — ready-made user module with
  CQRS queries/commands that satisfy `UserPortSettings`.

**OAuth provider packages** (strategies, guards, and controllers live here):

- [`@concepta/nestjs-auth-apple`](../nestjs-auth-apple) — Apple OAuth2 strategy.
- [`@concepta/nestjs-auth-github`](../nestjs-auth-github) — GitHub OAuth2 strategy.
- [`@concepta/nestjs-auth-google`](../nestjs-auth-google) — Google OAuth2 strategy.
- [`@concepta/rockets-federated`](../rockets-federated) — Federated identity storage
  (required by all OAuth provider packages).

**OTP integration** (required for recovery and verify features):

- [`@concepta/rockets-otp`](../rockets-otp) — ready-made OTP module with CQRS
  queries/commands that satisfy `OtpPortSettings`.
