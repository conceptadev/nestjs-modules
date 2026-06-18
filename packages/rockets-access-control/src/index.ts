// Module facade + options
export { AccessControlModule } from './access-control.module';
export {
  AccessControlOptions,
  AccessControlAsyncOptions,
} from './access-control.module-definition';

// Constants
export {
  ACCESS_CONTROL_MODULE_SETTINGS_TOKEN,
  ACCESS_CONTROL_PORT_TOKEN,
} from './access-control.constants';

// Gateways
export { AccessControlGuard } from './gateways/http/access-control.guard';
export { AccessControlFilter } from './gateways/http/access-control.filter';

// Decorators
export { AccessControlGrant } from './gateways/decorators/access-control-grant.decorator';
export { AccessControlQuery } from './gateways/decorators/access-control-query.decorator';
export { AccessControlCreateMany } from './gateways/decorators/access-control-create-many.decorator';
export { AccessControlCreateOne } from './gateways/decorators/access-control-create-one.decorator';
export { AccessControlDeleteOne } from './gateways/decorators/access-control-delete-one.decorator';
export { AccessControlReadMany } from './gateways/decorators/access-control-read-many.decorator';
export { AccessControlReadOne } from './gateways/decorators/access-control-read-one.decorator';
export { AccessControlRecoverOne } from './gateways/decorators/access-control-recover-one.decorator';
export { AccessControlReplaceOne } from './gateways/decorators/access-control-replace-one.decorator';
export { AccessControlUpdateOne } from './gateways/decorators/access-control-update-one.decorator';

// Domain types
export { AccessControlContext } from './domain/access-control.context';
export { PossessionEnum } from './domain/enums/possession.enum';
export { CanAccess } from './domain/policies/can-access.policy';
export { AccessControlContextInterface } from './domain/interfaces/access-control-context.interface';
export { AccessControlGrantOptionInterface } from './domain/interfaces/access-control-grant-option.interface';
export { AccessControlQueryOptionInterface } from './domain/interfaces/access-control-query-option.interface';
export { AccessControlMetadataInterface } from './domain/interfaces/access-control-metadata.interface';
export { AccessControlServiceInterface } from './domain/ports/access-control-service.interface';

// Port
export {
  AccessControlPort,
  AccessControlPortSettings,
  CheckAccessQueryInterface,
  FilterResponseAttributesQueryInterface,
  ResolveUserRolesQueryInterface,
} from './application/ports/access-control.port';
export { DEFAULT_ACCESS_CONTROL_PORT_SETTINGS } from './access-control.module-definition';

// Infrastructure
export { AccessControlService } from './infrastructure/services/access-control.service';
export { AccessControlOptionsInterface } from './infrastructure/config/interfaces/access-control-options.interface';
export { AccessControlSettingsInterface } from './infrastructure/config/interfaces/access-control-settings.interface';

// Application — queries + handlers
export { CheckAccessQuery } from './application/queries/impl/check-access.query';
export { FilterResponseAttributesQuery } from './application/queries/impl/filter-response-attributes.query';
export { ResolveUserRolesQuery } from './application/queries/impl/resolve-user-roles.query';
export { CheckAccessHandler } from './application/queries/handlers/check-access.handler';
export { FilterResponseAttributesHandler } from './application/queries/handlers/filter-response-attributes.handler';
export { ResolveUserRolesHandler } from './application/queries/handlers/resolve-user-roles.handler';

/**
 * @deprecated Kept for v7 consumer compatibility. Will be removed once
 * external callers migrate off it.
 */
export { AccessControllerException } from './domain/exceptions/access-controller.exception';
