import {
  createMockCommandBus,
  createMockEventPublisher,
} from '@concepta/nestjs-common/testing';
import { createMockTransaction } from '@concepta/nestjs-repository/testing';

import { Invitation } from '../../domain/aggregates/invitation';
import { InvitationService } from '../../domain/services/invitation.service';
import { InvitationEntityInterface } from '../../infrastructure/persistence/interfaces/invitation-entity.interface';
import { InvitationMapper } from '../../infrastructure/persistence/invitation.mapper';
import { InvitationRepository } from '../../infrastructure/persistence/invitation.repository';

export {
  createMockCommandBus,
  createMockEventPublisher,
  createMockTransaction,
};
export type { MockTransactionHandle } from '@concepta/nestjs-repository/testing';

export function createMockInvitationService(): jest.Mocked<InvitationService> {
  return {
    create: jest.fn(),
    createByEmail: jest.fn(),
    send: jest.fn(),
    sendById: jest.fn(),
    accept: jest.fn(),
    remove: jest.fn(),
    revokeByEmail: jest.fn(),
    revokeByUserId: jest.fn(),
  } as unknown as jest.Mocked<InvitationService>;
}

export function createMockInvitationRepository(): jest.Mocked<InvitationRepository> {
  return {
    get: jest.fn(),
    findOneByCode: jest.fn(),
    findAllByUserAndCategory: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  } as unknown as jest.Mocked<InvitationRepository>;
}

export function createMockInvitationEntity(
  overrides: Partial<InvitationEntityInterface> = {},
): InvitationEntityInterface {
  return {
    id: 'test-id',
    code: 'test-code',
    category: 'user',
    userId: 'test-user-id',
    active: true,
    constraints: undefined,
    dateAccepted: null,
    dateRevoked: null,
    dateCreated: new Date('2026-01-01'),
    dateUpdated: new Date('2026-01-01'),
    dateDeleted: null,
    version: 1,
    ...overrides,
  };
}

const invitationMapper = new InvitationMapper();

export function toInvitationDomain(
  entity: InvitationEntityInterface,
): Invitation {
  return invitationMapper.toDomain(entity);
}
