// module
export { FederatedModule } from './federated.module';

// aggregate
export { Identity } from './domain/aggregates/identity';

// domain interfaces
export { IdentityInterface } from './domain/interfaces/identity.interface';
export { IdentityCreatableInterface } from './domain/interfaces/identity-creatable.interface';

// domain events
export { IdentityCreatedEvent } from './domain/events/identity-created.event';

// domain repositories
export { IdentityRepositoryInterface } from './domain/repositories/identity-repository.interface';

// domain ports
export {
  FederatedUserPort,
  FederatedUserPortSettings,
  FederatedUserResult,
  GetUserByIdQueryInterface,
  GetUserByEmailQueryInterface,
  CreateUserCommandInterface,
} from './domain/ports/federated-user.port';

// domain services
export { FederatedOAuthService } from './domain/services/federated-oauth.service';
export { FederatedOAuthServiceInterface } from './domain/services/federated-oauth-service.interface';

// commands
export { CreateIdentityCommand } from './application/commands/impl/create-identity.command';

// command handlers
export { CreateIdentityHandler } from './application/commands/handlers/create-identity.handler';

// queries
export { FindIdentityByProviderQuery } from './application/queries/impl/find-identity-by-provider.query';

// query handlers
export { FindIdentityByProviderHandler } from './application/queries/handlers/find-identity-by-provider.handler';

// public interfaces
export { FederatedCredentialsInterface } from './interfaces/federated-credentials.interface';
export { FederatedOptionsInterface } from './interfaces/federated-options.interface';
export { FederatedOptionsExtrasInterface } from './interfaces/federated-options-extras.interface';

// config interfaces
export { FederatedSettingsInterface } from './infrastructure/config/interfaces/federated-settings.interface';

// DTOs
export { IdentityDto } from './infrastructure/dtos/identity.dto';
export { IdentityCreateDto } from './infrastructure/dtos/identity-create.dto';

// persistence
export { IdentityMapper } from './infrastructure/persistence/identity.mapper';
export { IdentityRepository } from './infrastructure/persistence/identity.repository';
export { IdentityEntityInterface } from './infrastructure/persistence/interfaces/identity-entity.interface';

// domain exceptions
export { FederatedException } from './domain/exceptions/federated.exception';
export { IdentityCreateUserException } from './domain/exceptions/identity-create-user.exception';
export { IdentityFindUserException } from './domain/exceptions/identity-find-user.exception';
export { IdentityUserRelationshipException } from './domain/exceptions/identity-user-relationship.exception';

// constants
export {
  FEDERATED_MODULE_SETTINGS_TOKEN,
  FEDERATED_MODULE_DEFAULT_ENTITY_KEY,
  FEDERATED_MODULE_IDENTITY_REPOSITORY_TOKEN,
} from './federated.constants';
