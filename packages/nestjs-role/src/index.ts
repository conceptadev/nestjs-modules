// module
export { RoleModule } from './role.module';

// domain aggregates
export { Role } from './domain/aggregates/role';
export { RoleAssignment } from './domain/aggregates/role-assignment';

// repositories
export { RoleRepository } from './infrastructure/persistence/role.repository';
export { RoleAssignmentRepository } from './infrastructure/persistence/role-assignment.repository';
export { RoleRepositoryResolver } from './infrastructure/persistence/role-repository.resolver';
export { RoleAssignmentRepositoryResolver } from './infrastructure/persistence/role-assignment-repository.resolver';

// dtos
export { RoleDto } from './infrastructure/dtos/role.dto';
export { RolePaginatedDto } from './infrastructure/dtos/role-paginated.dto';
export { RoleCreateDto } from './infrastructure/dtos/role-create.dto';
export { RoleUpdateDto } from './infrastructure/dtos/role-update.dto';
export { RoleAssignmentDto } from './infrastructure/dtos/role-assignment.dto';
export { RoleAssignmentPaginatedDto } from './infrastructure/dtos/role-assignment-paginated.dto';
export { RoleAssignmentCreateDto } from './infrastructure/dtos/role-assignment-create.dto';

// commands
export { CreateRoleCommand } from './application/commands/impl/create-role.command';
export { UpdateRoleCommand } from './application/commands/impl/update-role.command';
export { ReplaceRoleCommand } from './application/commands/impl/replace-role.command';
export { RemoveRoleCommand } from './application/commands/impl/remove-role.command';
export { AssignRoleCommand } from './application/commands/impl/assign-role.command';
export { AssignRolesCommand } from './application/commands/impl/assign-roles.command';
export { RevokeRoleCommand } from './application/commands/impl/revoke-role.command';
export { RevokeRolesCommand } from './application/commands/impl/revoke-roles.command';

// events
export { RoleCreatedEvent } from './domain/events/role-created.event';
export { RoleUpdatedEvent } from './domain/events/role-updated.event';
export { RoleReplacedEvent } from './domain/events/role-replaced.event';
export { RoleAssignedEvent } from './domain/events/role-assigned.event';
export { RoleRevokedEvent } from './domain/events/role-revoked.event';

// queries
export { GetRoleQuery } from './application/queries/impl/get-role.query';
export { GetAssignedRolesQuery } from './application/queries/impl/get-assigned-roles.query';
export { IsAssignedRoleQuery } from './application/queries/impl/is-assigned-role.query';
export { IsAssignedRolesQuery } from './application/queries/impl/is-assigned-roles.query';
export { GetRoleAssignmentQuery } from './application/queries/impl/get-role-assignment.query';

// command handlers
export { CreateRoleHandler } from './application/commands/handlers/create-role.handler';
export { UpdateRoleHandler } from './application/commands/handlers/update-role.handler';
export { ReplaceRoleHandler } from './application/commands/handlers/replace-role.handler';
export { RemoveRoleHandler } from './application/commands/handlers/remove-role.handler';
export { AssignRoleHandler } from './application/commands/handlers/assign-role.handler';
export { AssignRolesHandler } from './application/commands/handlers/assign-roles.handler';
export { RevokeRoleHandler } from './application/commands/handlers/revoke-role.handler';
export { RevokeRolesHandler } from './application/commands/handlers/revoke-roles.handler';

// query handlers
export { GetRoleHandler } from './application/queries/handlers/get-role.handler';
export { GetAssignedRolesHandler } from './application/queries/handlers/get-assigned-roles.handler';
export { IsAssignedRoleHandler } from './application/queries/handlers/is-assigned-role.handler';
export { IsAssignedRolesHandler } from './application/queries/handlers/is-assigned-roles.handler';
export { GetRoleAssignmentHandler } from './application/queries/handlers/get-role-assignment.handler';

// domain repository interfaces
export { RoleRepositoryInterface } from './domain/repositories/role-repository.interface';
export { RoleRepositoryResolverInterface } from './domain/repositories/role-repository-resolver.interface';
export { RoleAssignmentRepositoryInterface } from './domain/repositories/role-assignment-repository.interface';
export { RoleAssignmentRepositoryResolverInterface } from './domain/repositories/role-assignment-repository-resolver.interface';

// interfaces
export { RoleOptionsInterface } from './infrastructure/config/interfaces/role-options.interface';
export { RoleSettingsInterface } from './infrastructure/config/interfaces/role-settings.interface';
export { RoleExtrasInterface } from './infrastructure/config/interfaces/role-extras.interface';

// exceptions
export { RoleException } from './application/exceptions/role.exception';
// context overlay
export { RoleContextOverlay, RoleCtx } from './gateways/role-context.overlay';

export { RoleAssignmentConflictException } from './application/exceptions/role-assignment-conflict.exception';
export { RoleAssignmentsConflictException } from './application/exceptions/role-assignments-conflict.exception';
export { RoleEntityNotFoundException } from './infrastructure/exceptions/role-entity-not-found.exception';
export { RoleNotFoundException } from './application/exceptions/role-not-found.exception';
export { RoleAssignmentNotFoundException } from './application/exceptions/role-assignment-not-found.exception';
