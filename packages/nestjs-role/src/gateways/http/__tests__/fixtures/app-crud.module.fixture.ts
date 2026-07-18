import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CoreModule, ExceptionsFilter, Operation } from '@concepta/nestjs-core';
import { CrudCqrsResolver, CrudModule } from '@concepta/nestjs-crud';
import { RepositoryModule } from '@concepta/nestjs-repository';
import { TypeOrmRepositoryModule } from '@concepta/nestjs-repository-typeorm';

import { RoleEntityFixture } from '../../../../__tests__/fixtures/entities/role-entity.fixture.js';
import { UserEntityFixture } from '../../../../__tests__/fixtures/entities/user-entity.fixture.js';
import { UserRoleEntityFixture } from '../../../../__tests__/fixtures/entities/user-role-entity.fixture.js';
import { RoleAssignmentEntityInterface } from '../../../../domain/interfaces/role-assignment-entity.interface.js';
import { RoleInterface } from '../../../../domain/interfaces/role.interface.js';
import { RoleNamespace } from '../../../../gateways/decorators/role-namespace.decorator.js';
import { RoleAssignmentCreateDto } from '../../../../infrastructure/dtos/role-assignment-create.dto.js';
import { RoleAssignmentPaginatedDto } from '../../../../infrastructure/dtos/role-assignment-paginated.dto.js';
import { RoleAssignmentDto } from '../../../../infrastructure/dtos/role-assignment.dto.js';
import { RoleCreateDto } from '../../../../infrastructure/dtos/role-create.dto.js';
import { RolePaginatedDto } from '../../../../infrastructure/dtos/role-paginated.dto.js';
import { RoleUpdateDto } from '../../../../infrastructure/dtos/role-update.dto.js';
import { RoleDto } from '../../../../infrastructure/dtos/role.dto.js';
import { RoleModule } from '../../../../role.module.js';
import { CreateRoleAssignmentRequestHandler } from '../../commands/handlers/create-role-assignment-request.handler.js';
import { CreateRoleRequestHandler } from '../../commands/handlers/create-role-request.handler.js';
import { DeleteRoleAssignmentRequestHandler } from '../../commands/handlers/delete-role-assignment-request.handler.js';
import { DeleteRoleRequestHandler } from '../../commands/handlers/delete-role-request.handler.js';
import { ReplaceRoleRequestHandler } from '../../commands/handlers/replace-role-request.handler.js';
import { UpdateRoleRequestHandler } from '../../commands/handlers/update-role-request.handler.js';
import { CreateRoleAssignmentRequest } from '../../commands/impl/create-role-assignment.request.js';
import { CreateRoleRequest } from '../../commands/impl/create-role.request.js';
import { DeleteRoleAssignmentRequest } from '../../commands/impl/delete-role-assignment.request.js';
import { DeleteRoleRequest } from '../../commands/impl/delete-role.request.js';
import { ReplaceRoleRequest } from '../../commands/impl/replace-role.request.js';
import { UpdateRoleRequest } from '../../commands/impl/update-role.request.js';
import { ListRoleAssignmentsRequestHandler } from '../../queries/handlers/list-role-assignments-request.handler.js';
import { ListRolesRequestHandler } from '../../queries/handlers/list-roles-request.handler.js';
import { ReadRoleAssignmentRequestHandler } from '../../queries/handlers/read-role-assignment-request.handler.js';
import { ReadRoleRequestHandler } from '../../queries/handlers/read-role-request.handler.js';
import { ListRoleAssignmentsRequest } from '../../queries/impl/list-role-assignments.request.js';
import { ListRolesRequest } from '../../queries/impl/list-roles.request.js';
import { ReadRoleAssignmentRequest } from '../../queries/impl/read-role-assignment.request.js';
import { ReadRoleRequest } from '../../queries/impl/read-role.request.js';

const ROLE_ENTITY_KEY = 'role';
const USER_ROLE_ENTITY_KEY = 'userRole';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: ':memory:',
      synchronize: true,
      entities: [RoleEntityFixture, UserRoleEntityFixture, UserEntityFixture],
    }),
    CqrsModule.forRoot(),
    RepositoryModule.forRoot({}),
    CrudModule.forRoot({
      defaultResolver: CrudCqrsResolver,
    }),
    CoreModule.forRoot(),
    RepositoryModule.forFeature({
      module: TypeOrmRepositoryModule,
      entities: [
        { key: ROLE_ENTITY_KEY, entity: RoleEntityFixture },
        { key: USER_ROLE_ENTITY_KEY, entity: UserRoleEntityFixture },
      ],
    }),
    RoleModule.forRoot({}),
    RoleModule.forFeature({
      roleEntityKey: ROLE_ENTITY_KEY,
      assignmentEntityKeys: [USER_ROLE_ENTITY_KEY],
    }),
    CrudModule.forFeature<RoleInterface>({
      crud: {
        controller: {
          entity: ROLE_ENTITY_KEY,
          path: 'role',
          resolver: CrudCqrsResolver,
          transactional: true,
          extraDecorators: [RoleNamespace({ name: ROLE_ENTITY_KEY })],
          request: { body: RoleCreateDto },
          response: {
            resource: RoleDto,
            paginated: RolePaginatedDto,
          },
        },
        operations: [
          {
            operation: Operation.List,
            query: ListRolesRequest,
            queryHandler: ListRolesRequestHandler,
          },
          {
            operation: Operation.Read,
            query: ReadRoleRequest,
            queryHandler: ReadRoleRequestHandler,
          },
          {
            operation: Operation.Create,
            request: { body: RoleCreateDto },
            command: CreateRoleRequest,
            commandHandler: CreateRoleRequestHandler,
          },
          {
            operation: Operation.Update,
            request: { body: RoleUpdateDto },
            command: UpdateRoleRequest,
            commandHandler: UpdateRoleRequestHandler,
          },
          {
            operation: Operation.Replace,
            request: { body: RoleCreateDto },
            command: ReplaceRoleRequest,
            commandHandler: ReplaceRoleRequestHandler,
          },
          {
            operation: Operation.Delete,
            command: DeleteRoleRequest,
            commandHandler: DeleteRoleRequestHandler,
          },
        ],
      },
    }),
    CrudModule.forFeature<RoleAssignmentEntityInterface>({
      crud: {
        controller: {
          entity: USER_ROLE_ENTITY_KEY,
          path: 'role-assignment/user',
          resolver: CrudCqrsResolver,
          transactional: true,
          extraDecorators: [RoleNamespace({ name: USER_ROLE_ENTITY_KEY })],
          request: { body: RoleAssignmentCreateDto },
          response: {
            resource: RoleAssignmentDto,
            paginated: RoleAssignmentPaginatedDto,
          },
        },
        operations: [
          {
            operation: Operation.List,
            query: ListRoleAssignmentsRequest,
            queryHandler: ListRoleAssignmentsRequestHandler,
          },
          {
            operation: Operation.Read,
            query: ReadRoleAssignmentRequest,
            queryHandler: ReadRoleAssignmentRequestHandler,
          },
          {
            operation: Operation.Create,
            request: { body: RoleAssignmentCreateDto },
            command: CreateRoleAssignmentRequest,
            commandHandler: CreateRoleAssignmentRequestHandler,
          },
          {
            operation: Operation.Delete,
            command: DeleteRoleAssignmentRequest,
            commandHandler: DeleteRoleAssignmentRequestHandler,
          },
        ],
      },
    }),
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ExceptionsFilter,
    },
  ],
})
export class AppCrudModuleFixture {}
