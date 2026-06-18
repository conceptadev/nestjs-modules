# Rockets

![Rockets Logo](https://raw.githubusercontent.com/conceptadev/rockets/main/assets/rockets-icon.svg)

## Project

[![Codacy](https://app.codacy.com/project/badge/Grade/6b92bb0756ee4664a1403c4688a0d172)](https://www.codacy.com/gh/conceptadev/rockets/dashboard?utm_source=github.com&utm_medium=referral&utm_content=conceptadev/rockets&utm_campaign=Badge_Grade)
[![Code Climate Maint](https://img.shields.io/codeclimate/maintainability/conceptadev/rockets?logo=codeclimate)](https://codeclimate.com/github/conceptadev/rockets)
[![Code Climate Debt](https://img.shields.io/codeclimate/tech-debt/conceptadev/rockets?logo=codeclimate)](https://codeclimate.com/github/conceptadev/rockets)
[![Codecov](https://codecov.io/gh/conceptadev/rockets/branch/main/graph/badge.svg?token=QXUHV1RP5N)](https://codecov.io/gh/conceptadev/rockets)
[![GitHub Build](https://img.shields.io/github/actions/workflow/status/conceptadev/rockets/ci-pr-test.yml?logo=github)](https://github.com/conceptadev/rockets/actions/workflows/ci-pr-test.yml)
[![GH Commits](https://img.shields.io/github/commit-activity/m/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets)
[![GH Last Commit](https://img.shields.io/github/last-commit/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets)
[![GH Contrib](https://img.shields.io/github/contributors/conceptadev/rockets?logo=github)](https://github.com/conceptadev/rockets/graphs/contributors)

```text
Rapid Enterprise Development Toolkit
```

A collection of NestJS modules
that were created for the rapid development of enterpise level APIs.

All reasonable efforts have been made to provide loosely coupled interfaces,
overridable services, and sane default implementations.

## Contributing

This project is currently in alpha testing, however, feedback is highly
appreciated and encouraged!

Pull requests will be gratefully accepted in the very near future,
once we have finalized our Contributor License Agreement.

## Modules

| Module                                                                                                                           | Summary                                                                                                                                     |
| -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| [rockets-access-control](https://github.com/conceptadev/rockets/tree/main/packages/rockets-access-control 'rockets-access-control') | Advanced access control guard for NestJS with optional per-request filtering.                                                               |
| [nestjs-auth-github](https://github.com/conceptadev/rockets/tree/main/packages/nestjs-auth-github 'nestjs-auth-github')          | Authenticate requests using GitHub oAuth2 sign-on.                                                                                          |
| [rockets-authentication](https://github.com/conceptadev/rockets/tree/main/packages/rockets-authentication 'rockets-authentication') | Full-featured authentication module (JWT, local, refresh, recovery, verify, OAuth router) using DDD and CQRS.                               |
| [nestjs-common](https://github.com/conceptadev/rockets/tree/main/packages/nestjs-common 'nestjs-common')                         | The common module is a dependency of all Rockets modules.                                                                                   |
| [rockets-crud](https://github.com/conceptadev/rockets/tree/main/packages/rockets-crud 'rockets-crud')                               | Extremely powerful CRUD module that is an extension/wrapper of the popular @nestjsx/crud module.                                            |
| [nestjs-email](https://github.com/conceptadev/rockets/tree/main/packages/nestjs-email 'nestjs-email')                            | Email deliver module that supports most popular transports, as well as template based email bodies using handlebars syntax.                 |
| [nestjs-event](https://github.com/conceptadev/rockets/tree/main/packages/nestjs-event 'nestjs-event')                            | Advanced class based event dispatch/listener module.                                                                                        |
| [nestjs-logger](https://github.com/conceptadev/rockets/tree/main/packages/nestjs-logger 'nestjs-logger')                         | Drop-in replacement for the core NestJS logger that provides additonal support for pushing log data to external log providers.              |
| [rockets-password](https://github.com/conceptadev/rockets/tree/main/packages/rockets-password 'rockets-password')                   | A flexible Password utilities module that provides services for password strength, creation and storage.                                    |
| [nestjs-swagger-ui](https://github.com/conceptadev/rockets/tree/main/packages/nestjs-swagger-ui 'nestjs-swagger-ui')             | Expose your OpenApi spec on your API using the powerful Swagger UI interface.                                                               |
| [nestjs-typeorm-ext](https://github.com/conceptadev/rockets/tree/main/packages/nestjs-typeorm-ext 'nestjs-typeorm-ext')          | Extension of the NestJS TypeOrm module that allows your dynamic modules to accept drop-in replacements of custom entities and repositories. |
| [rockets-user](https://github.com/conceptadev/rockets/tree/main/packages/rockets-user 'rockets-user')                               | A module for managing a basic User entity, including controller with full CRUD, DTOs, sample data factory and seeder.                       |
