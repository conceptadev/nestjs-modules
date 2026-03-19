import {
  createMockCommandBus,
  createMockEventContext as createMockEventContextBase,
  createMockEventPublisher,
  createMockQueryBus,
} from '@concepta/nestjs-common/testing';
import {
  createMockContext as createMockContextBase,
  createMockTransaction,
} from '@concepta/nestjs-repository/testing';

import { Otp } from '../../domain/aggregates/otp';
import { OtpSettingsInterface } from '../../infrastructure/config/interfaces/otp-settings.interface';
import { OtpEntityInterface } from '../../infrastructure/persistence/interfaces/otp-entity.interface';
import { OtpRepositoryResolver } from '../../infrastructure/persistence/otp-repository.resolver';
import { OtpMapper } from '../../infrastructure/persistence/otp.mapper';
import { OtpRepository } from '../../infrastructure/persistence/otp.repository';

export {
  createMockCommandBus,
  createMockEventPublisher,
  createMockQueryBus,
  createMockTransaction,
};
export type { MockTransactionHandle } from '@concepta/nestjs-repository/testing';

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

export function createMockContext(entity = 'userOtp') {
  return createMockContextBase(entity);
}

export function createMockEventContext(entity = 'userOtp') {
  return createMockEventContextBase(entity);
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
