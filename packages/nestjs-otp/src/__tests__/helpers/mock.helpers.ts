import { mockDeep, DeepMockProxy } from 'jest-mock-extended';

import { createMockTransaction } from '@concepta/nestjs-repository/testing';
import { EventContextHost } from '@concepta/rockets-app';
import {
  createMockCommandBus,
  createMockEventPublisher,
  createMockQueryBus,
} from '@concepta/rockets-app/testing';

import { Otp } from '../../domain/aggregates/otp';
import { OtpSettingsInterface } from '../../infrastructure/config/interfaces/otp-settings.interface';
import { OtpEntityInterface } from '../../infrastructure/persistence/interfaces/otp-entity.interface';
import { OtpRepositoryResolver } from '../../infrastructure/persistence/otp-repository.resolver';
import { OtpMapper } from '../../infrastructure/persistence/otp.mapper';
import { OtpRepository } from '../../infrastructure/persistence/otp.repository';

export const DEFAULT_OTP_NAMESPACE = 'userOtp';

export {
  createMockCommandBus,
  createMockEventPublisher,
  createMockQueryBus,
  createMockTransaction,
};
export type { MockTransactionHandle } from '@concepta/nestjs-repository/testing';

export function createMockOtpRepository(): DeepMockProxy<OtpRepository> {
  return mockDeep<OtpRepository>();
}

export function createMockRepositoryResolver(
  repo: OtpRepository,
): DeepMockProxy<OtpRepositoryResolver> {
  const resolver = mockDeep<OtpRepositoryResolver>();
  resolver.resolve.mockReturnValue(repo);
  return resolver;
}

export function createMockEventContext(namespace = DEFAULT_OTP_NAMESPACE) {
  return new EventContextHost({ namespace }, {});
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
