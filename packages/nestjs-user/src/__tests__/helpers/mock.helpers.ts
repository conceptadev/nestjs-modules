import { mockDeep, type DeepMockProxy } from 'jest-mock-extended';

import { type EventPublisher } from '@nestjs/cqrs';

import { AppContextHost } from '@concepta/nestjs-core';
import {
  TrxCtx,
  type TransactionScope,
  type TransactionContextInterface,
} from '@concepta/nestjs-repository';

import { type User } from '../../domain/aggregates/user';
import { type UserCredentials } from '../../domain/aggregates/user-credentials';
import { type UserCredentialEntityInterface } from '../../domain/interfaces/user-credential-entity.interface';
import { type UserEntityInterface } from '../../domain/interfaces/user-entity.interface';
import { type UserPasswordPort } from '../../domain/ports/user-password.port';
import { type UserCredentialsRepositoryInterface } from '../../domain/repositories/user-credentials-repository.interface';
import { type UserRepositoryInterface } from '../../domain/repositories/user-repository.interface';
import { type UserCredentialsService } from '../../domain/services/user-credentials.service';
import { UserCredentialsMapper } from '../../infrastructure/persistence/user-credentials.mapper';
import { UserMapper } from '../../infrastructure/persistence/user.mapper';

export function createMockTxScope(): DeepMockProxy<TransactionScope> {
  const trxHandle = {
    onCommit: jest.fn(),
    onRollback: jest.fn(),
  };

  const mockHost = new AppContextHost();
  mockHost.defineOverlay(TrxCtx, {
    trx: trxHandle,
  } as unknown as TransactionContextInterface);
  const mockTxCtx = mockHost.with(TrxCtx);

  const txScope = mockDeep<TransactionScope>();
  txScope.run.mockImplementation((_ctx, fn) => fn(mockTxCtx));

  return txScope;
}

export function createMockEventPublisher(): DeepMockProxy<EventPublisher> {
  const publisher = mockDeep<EventPublisher>();
  publisher.mergeObjectContext.mockImplementation((obj) => {
    obj.commit = jest.fn();
    obj.uncommit = jest.fn();
    return obj;
  });
  return publisher;
}

export function createMockUserRepository(): jest.Mocked<UserRepositoryInterface> {
  return {
    get: jest.fn(),
    findByEmail: jest.fn(),
    findByUsername: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };
}

export function createMockUserCredentialsRepository(): jest.Mocked<UserCredentialsRepositoryInterface> {
  return {
    findActiveByUserId: jest.fn(),
    findByUserId: jest.fn(),
    save: jest.fn(),
  };
}

export function createMockPasswordPort(): DeepMockProxy<UserPasswordPort> {
  return mockDeep<UserPasswordPort>();
}

export function createMockUserCredentialsService(): DeepMockProxy<UserCredentialsService> {
  return mockDeep<UserCredentialsService>();
}

export function createMockUserEntity(
  overrides: Partial<UserEntityInterface> = {},
): UserEntityInterface {
  return {
    id: 'user-1',
    email: 'a@b.com',
    username: 'john',
    active: true,
    dateCreated: new Date('2026-01-01'),
    dateUpdated: new Date('2026-01-01'),
    dateDeleted: null,
    version: 1,
    ...overrides,
  };
}

export function createMockUserCredentialEntity(
  overrides: Partial<UserCredentialEntityInterface> = {},
): UserCredentialEntityInterface {
  return {
    id: 'cred-1',
    userId: 'user-1',
    passwordHash: 'old-hash',
    active: true,
    validFrom: new Date('2026-01-01'),
    validTo: null,
    dateCreated: new Date('2026-01-01'),
    dateUpdated: new Date('2026-01-01'),
    dateDeleted: null,
    version: 1,
    ...overrides,
  };
}

const userMapper = new UserMapper();
const credentialsMapper = new UserCredentialsMapper();

export function toUserDomain(entity: UserEntityInterface): User {
  return userMapper.toDomain(entity);
}

export function toUserCredentialsDomain(
  entity: UserCredentialEntityInterface,
): UserCredentials {
  return credentialsMapper.toDomain(entity);
}
