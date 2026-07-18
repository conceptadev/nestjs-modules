import { mock } from 'vitest-mock-extended';

import {
  createMockCommandBus,
  createMockEventPublisher,
} from '@concepta/nestjs-core/testing';
import { createMockTransaction } from '@concepta/nestjs-repository/testing';

import { type Identity } from '../../domain/aggregates/identity';
import { type FederatedUserPort } from '../../domain/ports/federated-user.port';
import { type FederatedOAuthService } from '../../domain/services/federated-oauth.service';
import { IdentityMapper } from '../../infrastructure/persistence/identity.mapper';
import { type IdentityRepository } from '../../infrastructure/persistence/identity.repository';
import { type IdentityEntityInterface } from '../../infrastructure/persistence/interfaces/identity-entity.interface';

export {
  createMockCommandBus,
  createMockEventPublisher,
  createMockTransaction,
};
export type { MockTransactionHandle } from '@concepta/nestjs-repository/testing';

export function createMockIdentityRepository() {
  return mock<IdentityRepository>();
}

export function createMockFederatedUserPort() {
  return mock<FederatedUserPort>();
}

export function createMockFederatedOAuthService() {
  return mock<FederatedOAuthService>();
}

export function createMockIdentityEntity(
  overrides: Record<string, unknown> = {},
): IdentityEntityInterface {
  return {
    id: 'identity-id',
    provider: 'google',
    subject: 'subject-id',
    user: { id: 'user-id' },
    dateCreated: new Date('2026-01-01'),
    dateUpdated: new Date('2026-01-01'),
    dateDeleted: null,
    version: 1,
    ...overrides,
  };
}

const identityMapper = new IdentityMapper();

export function toIdentityDomain(entity: IdentityEntityInterface): Identity {
  return identityMapper.toDomain(entity);
}
