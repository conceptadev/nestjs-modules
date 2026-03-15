// module
export { OtpModule } from './otp.module';

// domain aggregate
export { Otp } from './domain/aggregates/otp';

// repositories
export { OtpRepository } from './infrastructure/persistence/otp.repository';
export { OtpRepositoryResolver } from './infrastructure/persistence/otp-repository.resolver';
export { OtpRepositoryInterface } from './domain/repositories/otp-repository.interface';
export { OtpRepositoryResolverInterface } from './domain/repositories/otp-repository-resolver.interface';

// dto
export { OtpCreateDto } from './infrastructure/dtos/otp-create.dto';

// commands
export { ConsumeOtpCommand } from './application/commands/impl/consume-otp.command';
export { CreateOtpCommand } from './application/commands/impl/create-otp.command';
export { RemoveOtpCommand } from './application/commands/impl/remove-otp.command';
export { ClearOtpsCommand } from './application/commands/impl/clear-otps.command';
export { ClearOtpHistoryCommand } from './application/commands/impl/clear-otp-history.command';
export { DeactivateOtpCommand } from './application/commands/impl/deactivate-otp.command';

// events
export { OtpConsumedEvent } from './domain/events/otp-consumed.event';
export { OtpCreatedEvent } from './domain/events/otp-created.event';
export { OtpDeactivatedEvent } from './domain/events/otp-deactivated.event';

// queries
export { FindActiveOtpQuery } from './application/queries/impl/find-active-otp.query';
export { FindAssignedOtpsQuery } from './application/queries/impl/find-assigned-otps.query';
export { GetOtpQuery } from './application/queries/impl/get-otp.query';
export { ValidateOtpQuery } from './application/queries/impl/validate-otp.query';

// command handlers
export { ConsumeOtpHandler } from './application/commands/handlers/consume-otp.handler';
export { CreateOtpHandler } from './application/commands/handlers/create-otp.handler';
export { RemoveOtpHandler } from './application/commands/handlers/remove-otp.handler';
export { ClearOtpsHandler } from './application/commands/handlers/clear-otps.handler';
export { ClearOtpHistoryHandler } from './application/commands/handlers/clear-otp-history.handler';
export { DeactivateOtpHandler } from './application/commands/handlers/deactivate-otp.handler';

// event listeners
export { OtpHistoryCleanupListener } from './application/listeners/otp-history-cleanup.listener';

// domain services
export { OtpHistoryCleanupService } from './domain/services/otp-history-cleanup.service';

// query handlers
export { FindActiveOtpHandler } from './application/queries/handlers/find-active-otp.handler';
export { FindAssignedOtpsHandler } from './application/queries/handlers/find-assigned-otps.handler';
export { GetOtpHandler } from './application/queries/handlers/get-otp.handler';
export { ValidateOtpHandler } from './application/queries/handlers/validate-otp.handler';

// interfaces
export { OtpExtrasInterface } from './infrastructure/config/interfaces/otp-extras.interface';
export { OtpOptionsInterface } from './infrastructure/config/interfaces/otp-options.interface';
export { OtpSettingsInterface } from './infrastructure/config/interfaces/otp-settings.interface';
export { OtpTypeServiceInterface } from './infrastructure/config/interfaces/otp-type-service.interface';

// exceptions
export { OtpException } from './domain/exceptions/otp.exception';
export { OtpEntityNotFoundException } from './infrastructure/exceptions/otp-entity-not-found.exception';
export { OtpTypeNotDefinedException } from './domain/exceptions/otp-type-not-defined.exception';
export { OtpLimitReachedException } from './domain/exceptions/otp-limit-reached.exception';
export { OtpNotFoundException } from './application/exceptions/otp-not-found.exception';
export { OtpInvalidExpirationDateException } from './domain/exceptions/otp-invalid-expiration-date.exception';
