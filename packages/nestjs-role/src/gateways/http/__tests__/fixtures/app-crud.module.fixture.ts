import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ExceptionsFilter, Operation } from '@concepta/nestjs-common';
import { CrudCqrsResolver, CrudModule } from '@concepta/nestjs-crud';
import { HookModule } from '@concepta/nestjs-hook';
import { RepositoryModule } from '@concepta/nestjs-repository';
import { TypeOrmRepositoryModule } from '@concepta/nestjs-repository-typeorm';

import { RoleEntityFixture } from '../../../../__tests__/fixtures/entities/role-entity.fixture';
import { UserEntityFixture } from '../../../../__tests__/fixtures/entities/user-entity.fixture';
import { UserRoleEntityFixture } from '../../../../__tests__/fixtures/entities/user-role-entity.fixture';
import { RoleAssignmentEntityInterface } from '../../../../domain/interfaces/role-assignment-entity.interface';
import { RoleInterface } from '../../../../domain/interfaces/role.interface';
import { RoleNamespace } from '../../../../gateways/decorators/role-namespace.decorator';
import { RoleAssignmentCreateDto } from '../../../../infrastructure/dtos/role-assignment-create.dto';
import { RoleAssignmentPaginatedDto } from '../../../../infrastructure/dtos/role-assignment-paginated.dto';
import { RoleAssignmentDto } from '../../../../infrastructure/dtos/role-assignment.dto';
import { RoleCreateDto } from '../../../../infrastructure/dtos/role-create.dto';
import { RolePaginatedDto } from '../../../../infrastructure/dtos/role-paginated.dto';
import { RoleUpdateDto } from '../../../../infrastructure/dtos/role-update.dto';
import { RoleDto } from '../../../../infrastructure/dtos/role.dto';
import { RoleModule } from '../../../../role.module';
import { CreateRoleAssignmentRequestHandler } from '../../commands/handlers/create-role-assignment-request.handler';
import { CreateRoleRequestHandler } from '../../commands/handlers/create-role-request.handler';
import { DeleteRoleAssignmentRequestHandler } from '../../commands/handlers/delete-role-assignment-request.handler';
import { DeleteRoleRequestHandler } from '../../commands/handlers/delete-role-request.handler';
import { ReplaceRoleRequestHandler } from '../../commands/handlers/replace-role-request.handler';
import { UpdateRoleRequestHandler } from '../../commands/handlers/update-role-request.handler';
import { CreateRoleAssignmentRequest } from '../../commands/impl/create-role-assignment.request';
import { CreateRoleRequest } from '../../commands/impl/create-role.request';
import { DeleteRoleAssignmentRequest } from '../../commands/impl/delete-role-assignment.request';
import { DeleteRoleRequest } from '../../commands/impl/delete-role.request';
import { ReplaceRoleRequest } from '../../commands/impl/replace-role.request';
import { UpdateRoleRequest } from '../../commands/impl/update-role.request';
import { ListRoleAssignmentsRequestHandler } from '../../queries/handlers/list-role-assignments-request.handler';
import { ListRolesRequestHandler } from '../../queries/handlers/list-roles-request.handler';
import { ReadRoleAssignmentRequestHandler } from '../../queries/handlers/read-role-assignment-request.handler';
import { ReadRoleRequestHandler } from '../../queries/handlers/read-role-request.handler';
import { ListRoleAssignmentsRequest } from '../../queries/impl/list-role-assignments.request';
import { ListRolesRequest } from '../../queries/impl/list-roles.request';
import { ReadRoleAssignmentRequest } from '../../queries/impl/read-role-assignment.request';
import { ReadRoleRequest } from '../../queries/impl/read-role.request';

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
    HookModule.forRoot({}),
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
