import { EventPublisher } from '@nestjs/cqrs';

import { AppContextHost } from '@concepta/nestjs-common';
import {
  TrxCtx,
  TransactionScope,
  TransactionContextInterface,
} from '@concepta/nestjs-repository';

import { User } from '../../domain/aggregates/user';
import { UserCredentials } from '../../domain/aggregates/user-credentials';
import { UserCredentialEntityInterface } from '../../domain/interfaces/user-credential-entity.interface';
import { UserEntityInterface } from '../../domain/interfaces/user-entity.interface';
import { UserPasswordPort } from '../../domain/ports/user-password.port';
import { UserCredentialsRepositoryInterface } from '../../domain/repositories/user-credentials-repository.interface';
import { UserRepositoryInterface } from '../../domain/repositories/user-repository.interface';
import { UserCredentialsService } from '../../domain/services/user-credentials.service';
import { UserCredentialsMapper } from '../../infrastructure/persistence/user-credentials.mapper';
import { UserMapper } from '../../infrastructure/persistence/user.mapper';

export function createMockTxScope(): jest.Mocked<TransactionScope> {
  const trxHandle = {
    onCommit: jest.fn(),
    onRollback: jest.fn(),
  };

  const mockHost = new AppContextHost();
  mockHost.defineOverlay(TrxCtx, {
    trx: trxHandle,
  } as unknown as TransactionContextInterface);
  const mockTxCtx = mockHost.with(TrxCtx);

  const mock = {
    run: jest.fn(),
    runReadOnly: jest.fn(),
  } as unknown as jest.Mocked<TransactionScope>;

  mock.run.mockImplementation((_ctx, fn) => fn(mockTxCtx));

  return mock;
}

export function createMockEventPublisher(): jest.Mocked<EventPublisher> {
  return {
    mergeObjectContext: jest.fn().mockImplementation((obj) => {
      obj.commit = jest.fn();
      obj.uncommit = jest.fn();
      return obj;
    }),
  } as unknown as jest.Mocked<EventPublisher>;
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

export function createMockPasswordPort(): jest.Mocked<UserPasswordPort> {
  return {
    create: jest.fn(),
    validateCurrent: jest.fn(),
    validateHistory: jest.fn(),
  } as unknown as jest.Mocked<UserPasswordPort>;
}

export function createMockUserCredentialsService(): jest.Mocked<UserCredentialsService> {
  return {
    setPassword: jest.fn(),
    updatePassword: jest.fn(),
  } as unknown as jest.Mocked<UserCredentialsService>;
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
