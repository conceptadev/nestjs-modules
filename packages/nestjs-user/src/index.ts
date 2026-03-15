// module
export { UserModule } from './user.module';

// domain aggregates
export { User } from './domain/aggregates/user';
export { UserCredentials } from './domain/aggregates/user-credentials';

// repositories
export { UserRepository } from './infrastructure/persistence/user.repository';
export { UserCredentialsRepository } from './infrastructure/persistence/user-credentials.repository';
export { UserRepositoryInterface } from './domain/repositories/user-repository.interface';
export { UserCredentialsRepositoryInterface } from './domain/repositories/user-credentials-repository.interface';

// dtos
export { UserDto } from './infrastructure/dtos/user.dto';
export { UserCreateDto } from './infrastructure/dtos/user-create.dto';
export { UserUpdateDto } from './infrastructure/dtos/user-update.dto';
export { UserPasswordDto } from './infrastructure/dtos/password/user-password.dto';
export { UserPasswordUpdateDto } from './infrastructure/dtos/password/user-password-update.dto';
export { UserPasswordHashDto } from './infrastructure/dtos/password/user-password-hash.dto';

// commands
export { CreateUserCommand } from './application/commands/impl/create-user.command';
export { UpdateUserCommand } from './application/commands/impl/update-user.command';
export { RemoveUserCommand } from './application/commands/impl/remove-user.command';
export { CreateUserCredentialCommand } from './application/commands/impl/create-user-credential.command';
export { UpdateUserCredentialCommand } from './application/commands/impl/update-user-credential.command';
export { SetUserPasswordCommand } from './application/commands/impl/set-user-password.command';
export { UpdateUserPasswordCommand } from './application/commands/impl/update-user-password.command';

// events
export { UserCreatedEvent } from './domain/events/user-created.event';
export { UserUpdatedEvent } from './domain/events/user-updated.event';
export { UserRemovedEvent } from './domain/events/user-removed.event';
export { UserCredentialsCreatedEvent } from './domain/events/user-credentials-created.event';
export { UserCredentialsDeactivatedEvent } from './domain/events/user-credentials-deactivated.event';

// queries
export { GetUserQuery } from './application/queries/impl/get-user.query';
export { GetUserByEmailQuery } from './application/queries/impl/get-user-by-email.query';
export { GetUserByUsernameQuery } from './application/queries/impl/get-user-by-username.query';
export { GetUserBySubjectQuery } from './application/queries/impl/get-user-by-subject.query';

// command handlers
export { CreateUserHandler } from './application/commands/handlers/create-user.handler';
export { UpdateUserHandler } from './application/commands/handlers/update-user.handler';
export { RemoveUserHandler } from './application/commands/handlers/remove-user.handler';
export { CreateUserCredentialHandler } from './application/commands/handlers/create-user-credential.handler';
export { UpdateUserCredentialHandler } from './application/commands/handlers/update-user-credential.handler';
export { SetUserPasswordHandler } from './application/commands/handlers/set-user-password.handler';
export { UpdateUserPasswordHandler } from './application/commands/handlers/update-user-password.handler';

// query handlers
export { GetUserHandler } from './application/queries/handlers/get-user.handler';
export { GetUserByEmailHandler } from './application/queries/handlers/get-user-by-email.handler';
export { GetUserBySubjectHandler } from './application/queries/handlers/get-user-by-subject.handler';
export { GetUserByUsernameHandler } from './application/queries/handlers/get-user-by-username.handler';

// listeners
export { InvitationAcceptedListener } from './application/listeners/invitation-accepted.listener';

// domain services
export { UserCredentialsService } from './domain/services/user-credentials.service';

// interfaces
export { UserOptionsInterface } from './infrastructure/config/interfaces/user-options.interface';
export { UserExtrasInterface } from './infrastructure/config/interfaces/user-extras.interface';
export { UserSettingsInterface } from './infrastructure/config/interfaces/user-settings.interface';
export { UserCredentialsEventPayloadInterface } from './domain/events/interfaces/user-credentials-event-payload.interface';
export { PasswordPolicySettings } from './domain/policies/user-password.policy';

// exceptions
export { UserException } from './domain/exceptions/user.exception';
export { UserNotFoundException } from './application/exceptions/user-not-found.exception';
export { UserCredentialsAlreadyExistException } from './domain/exceptions/user-credentials-already-exist.exception';
export { UserPasswordCurrentInvalidException } from './domain/exceptions/user-password-current-invalid.exception';
export { UserPasswordHistoryViolationException } from './domain/exceptions/user-password-history-violation.exception';
