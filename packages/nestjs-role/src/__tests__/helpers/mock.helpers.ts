import {
  EntityHeaderInterface,
  EventContextHost,
  RepositoryContextInterface,
  RoleAssignmentEntityInterface,
  RoleEntityInterface,
} from '@concepta/nestjs-common';

import { RoleAssignmentRepositoryResolver } from '../../infrastructure/persistence/role-assignment-repository.resolver';
import { RoleAssignmentMapper } from '../../infrastructure/persistence/role-assignment.mapper';
import { RoleAssignmentRepository } from '../../infrastructure/persistence/role-assignment.repository';
import { RoleRepositoryResolver } from '../../infrastructure/persistence/role-repository.resolver';
import { RoleMapper } from '../../infrastructure/persistence/role.mapper';
import { RoleRepository } from '../../infrastructure/persistence/role.repository';

export interface MockTransactionHandle {
  onCommit: jest.Mock;
  onRollback: jest.Mock;
}

export function createMockRoleRepository(): jest.Mocked<RoleRepository> {
  return {
    get: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  } as unknown as jest.Mocked<RoleRepository>;
}

export function createMockRoleAssignmentRepository(): jest.Mocked<RoleAssignmentRepository> {
  return {
    get: jest.fn(),
    findByAssignee: jest.fn(),
    findByRoleIdsAndAssignee: jest.fn(),
    findOne: jest.fn(),
    countByRoleIdAndAssignee: jest.fn(),
    countByRoleIdsAndAssignee: jest.fn(),
    save: jest.fn(),
    saveMany: jest.fn(),
    remove: jest.fn(),
    removeMany: jest.fn(),
  } as unknown as jest.Mocked<RoleAssignmentRepository>;
}

export function createMockRoleRepositoryResolver(
  repo: RoleRepository,
): jest.Mocked<RoleRepositoryResolver> {
  return {
    resolve: jest.fn().mockReturnValue(repo),
  } as unknown as jest.Mocked<RoleRepositoryResolver>;
}

export function createMockAssignmentRepositoryResolver(
  repo: RoleAssignmentRepository,
): jest.Mocked<RoleAssignmentRepositoryResolver> {
  return {
    resolve: jest.fn().mockReturnValue(repo),
  } as unknown as jest.Mocked<RoleAssignmentRepositoryResolver>;
}

export function createMockTransaction(): {
  transaction: { run: jest.Mock };
  trxHandle: MockTransactionHandle;
} {
  const trxHandle: MockTransactionHandle = {
    onCommit: jest.fn(),
    onRollback: jest.fn(),
  };

  const transaction = {
    run: jest.fn((_ctx: unknown, fn: (trx: MockTransactionHandle) => unknown) =>
      fn(trxHandle),
    ),
  };

  return { transaction, trxHandle };
}

export function createMockEventPublisher() {
  return {
    mergeObjectContext: jest.fn((obj: unknown) => obj),
  };
}

export function createMockCommandBus() {
  return {
    execute: jest.fn(),
  };
}

export function createMockQueryBus() {
  return {
    execute: jest.fn(),
  };
}

export function createMockContext(entity = 'Role'): RepositoryContextInterface {
  return { entity } as RepositoryContextInterface;
}

export function createMockEventContext(
  entity = 'Role',
): EventContextHost<EntityHeaderInterface> {
  return EventContextHost.builder<EntityHeaderInterface>()
    .setHeader('entity', entity)
    .build();
}

export function createMockRoleEntity(
  overrides: Partial<RoleEntityInterface> = {},
): RoleEntityInterface {
  return {
    id: 'test-role-id',
    name: 'Test Role',
    description: 'A test role',
    dateCreated: new Date('2026-01-01'),
    dateUpdated: new Date('2026-01-01'),
    dateDeleted: null,
    version: 1,
    ...overrides,
  };
}

export function createMockRoleAssignmentEntity(
  overrides: Partial<RoleAssignmentEntityInterface> = {},
): RoleAssignmentEntityInterface {
  return {
    id: 'test-assignment-id',
    roleId: 'test-role-id',
    assigneeId: 'test-assignee-id',
    dateCreated: new Date('2026-01-01'),
    dateUpdated: new Date('2026-01-01'),
    dateDeleted: null,
    version: 1,
    ...overrides,
  };
}

const roleMapper = new RoleMapper();
const roleAssignmentMapper = new RoleAssignmentMapper();

export function toRoleDomain(entity: RoleEntityInterface) {
  return roleMapper.toDomain(entity);
}

export function toRoleAssignmentDomain(entity: RoleAssignmentEntityInterface) {
  return roleAssignmentMapper.toDomain(entity);
}
