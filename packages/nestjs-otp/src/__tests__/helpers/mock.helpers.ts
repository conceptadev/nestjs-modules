import { EventPublisher } from '@nestjs/cqrs';

import {
  EntityHeaderInterface,
  EventContextHost,
  RepositoryContextInterface,
} from '@concepta/nestjs-common';
import { TransactionScope } from '@concepta/nestjs-repository';

import { Otp } from '../../domain/aggregates/otp';
import { OtpSettingsInterface } from '../../infrastructure/config/interfaces/otp-settings.interface';
import { OtpEntityInterface } from '../../infrastructure/persistence/interfaces/otp-entity.interface';
import { OtpRepositoryResolver } from '../../infrastructure/persistence/otp-repository.resolver';
import { OtpMapper } from '../../infrastructure/persistence/otp.mapper';
import { OtpRepository } from '../../infrastructure/persistence/otp.repository';

export interface MockTransactionHandle {
  onCommit: jest.Mock;
  onRollback: jest.Mock;
}

export function createMockOtpRepository(): jest.Mocked<OtpRepository> {
  return {
    get: jest.fn(),
    findActiveByPasscode: jest.fn(),
    findByPasscode: jest.fn(),
    findActiveByAssignee: jest.fn(),
    findAllByAssigneeAndCategory: jest.fn(),
    countCreatedSince: jest.fn(),
    findOlderThan: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    removeAll: jest.fn(),
  } as unknown as jest.Mocked<OtpRepository>;
}

export function createMockRepositoryResolver(
  repo: OtpRepository,
): jest.Mocked<OtpRepositoryResolver> {
  return {
    resolve: jest.fn().mockReturnValue(repo),
  } as unknown as jest.Mocked<OtpRepositoryResolver>;
}

export function createMockTransaction(): {
  transaction: TransactionScope;
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
  } as unknown as TransactionScope;

  return { transaction, trxHandle };
}

export function createMockEventPublisher(): EventPublisher {
  return {
    mergeObjectContext: jest.fn((obj: unknown) => obj),
  } as unknown as EventPublisher;
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

export function createMockContext(
  entity = 'userOtp',
): RepositoryContextInterface {
  return { entity } as RepositoryContextInterface;
}

export function createMockOtpEntity(
  overrides: Partial<OtpEntityInterface> = {},
): OtpEntityInterface {
  return {
    id: 'test-id',
    category: 'test-category',
    type: 'uuid',
    passcode: 'test-passcode',
    assigneeId: 'test-assignee',
    expirationDate: new Date('2027-01-01'),
    active: true,
    dateCreated: new Date('2026-01-01'),
    dateUpdated: new Date('2026-01-01'),
    dateDeleted: null,
    version: 1,
    ...overrides,
  };
}

const otpMapper = new OtpMapper();

export function toOtpDomain(entity: OtpEntityInterface): Otp {
  return otpMapper.toDomain(entity);
}

export function createMockEventContext(
  entity = 'userOtp',
): EventContextHost<EntityHeaderInterface> {
  return EventContextHost.builder<EntityHeaderInterface>()
    .setHeader('entity', entity)
    .build();
}

export function createMockOtpSettings(): OtpSettingsInterface {
  return {
    types: {
      uuid: {
        generator: jest.fn().mockReturnValue('generated-passcode'),
        validator: jest.fn().mockReturnValue(true),
      },
    },
    duplicateStrategy: 'ALLOW',
    keepHistoryDays: undefined,
    rateSeconds: undefined,
    rateThreshold: undefined,
  };
}
