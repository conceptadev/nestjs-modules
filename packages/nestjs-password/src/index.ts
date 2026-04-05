// module
export { PasswordModule } from './password.module';

// enum
export { PasswordStrengthEnum } from './enum/password-strength.enum';

// domain policies
export {
  PasswordPolicy,
  PasswordPolicySettings,
} from './domain/policies/password.policy';

// domain services
export { PasswordCreationService } from './domain/services/password-creation.service';
export { PasswordStorageService } from './domain/services/password-storage.service';
export { PasswordValidationService } from './domain/services/password-validation.service';
export { PasswordStrengthService } from './domain/services/password-strength.service';

// public interfaces
export { PasswordCreationServiceInterface } from './interfaces/password-creation-service.interface';
export { PasswordStorageServiceInterface } from './interfaces/password-storage-service.interface';
export { PasswordValidationServiceInterface } from './interfaces/password-validation-service.interface';
export { PasswordStrengthServiceInterface } from './interfaces/password-strength-service.interface';
export { PasswordHashObjectOptionsInterface } from './interfaces/password-hash-object-options.interface';
export { PasswordValidateOptionsInterface } from './interfaces/password-validate-options.interface';
export { PasswordCurrentPasswordInterface } from './interfaces/password-current-password.interface';
export { PasswordHistoryPasswordInterface } from './interfaces/password-history-password.interface';

// config interfaces
export { PasswordOptionsInterface } from './infrastructure/config/interfaces/password-options.interface';
export { PasswordSettingsInterface } from './infrastructure/config/interfaces/password-settings.interface';

// commands
export { CreatePasswordCommand } from './application/commands/impl/create-password.command';
export { ValidatePasswordCommand } from './application/commands/impl/validate-password.command';
export { ValidateCurrentPasswordCommand } from './application/commands/impl/validate-current-password.command';
export { ValidatePasswordHistoryCommand } from './application/commands/impl/validate-password-history.command';

// command handlers
export { CreatePasswordHandler } from './application/commands/handlers/create-password.handler';
export { ValidatePasswordHandler } from './application/commands/handlers/validate-password.handler';
export { ValidateCurrentPasswordHandler } from './application/commands/handlers/validate-current-password.handler';
export { ValidatePasswordHistoryHandler } from './application/commands/handlers/validate-password-history.handler';

// exceptions
export { PasswordException } from './application/exceptions/password.exception';
export { PasswordCurrentRequiredException } from './application/exceptions/password-current-required.exception';
export { PasswordNotStrongException } from './application/exceptions/password-not-strong.exception';
export { PasswordRequiredException } from './application/exceptions/password-required.exception';
export { PasswordUsedRecentlyException } from './application/exceptions/password-used-recently.exception';
