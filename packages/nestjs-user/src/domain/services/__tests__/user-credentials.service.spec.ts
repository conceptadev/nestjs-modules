import {
  EventContextHost,
  RepositoryContextInterface,
  UserCredentialEntityInterface,
} from '@concepta/nestjs-common';
import {
  PasswordCreationServiceInterface,
  PasswordStorageServiceInterface,
} from '@concepta/nestjs-password';

import {
  createMockEventPublisher,
  createMockTxScope,
  createMockUserCredentialsRepository,
} from '../../../__tests__/helpers/mock.helpers';
import { UserCredentialsMapper } from '../../../infrastructure/persistence/user-credentials.mapper';
import { UserCredentialsAlreadyExistException } from '../../exceptions/user-credentials-already-exist.exception';
import { UserPasswordCurrentInvalidException } from '../../exceptions/user-password-current-invalid.exception';
import { UserPasswordHistoryViolationException } from '../../exceptions/user-password-history-violation.exception';
import { UserPasswordPolicy } from '../../policies/user-password.policy';
import { UserCredentialsService } from '../user-credentials.service';

describe(UserCredentialsService.name, () => {
  const ctx = {} as RepositoryContextInterface;
  const eventContext = EventContextHost.builder().build();
  const credentialsMapper = new UserCredentialsMapper();
  const mockCredentialEntity: UserCredentialEntityInterface = {
    id: 'cred-1',
    userId: 'user-1',
    passwordHash: 'old-hash',
    passwordSalt: 'old-salt',
    active: true,
    validFrom: new Date('2024-01-01'),
    validTo: null,
    dateCreated: new Date('2024-01-01'),
    dateUpdated: new Date('2024-01-01'),
    dateDeleted: null,
    version: 1,
  };

  function createMockPasswordCreationService() {
    return {
      create: jest.fn(),
      validateCurrent: jest.fn(),
      validateHistory: jest.fn(),
    } as unknown as jest.Mocked<PasswordCreationServiceInterface>;
  }

  function createMockPasswordStorageService() {
    return {
      generateSalt: jest.fn(),
      hash: jest.fn(),
      hashObject: jest.fn(),
    } as unknown as jest.Mocked<PasswordStorageServiceInterface>;
  }

  function setup(policy?: UserPasswordPolicy) {
    const userCredentialsRepository = createMockUserCredentialsRepository();
    const txScope = createMockTxScope();
    const eventPublisher = createMockEventPublisher();
    const passwordCreationService = createMockPasswordCreationService();
    const passwordStorageService = createMockPasswordStorageService();

    passwordStorageService.hash.mockResolvedValue({
      passwordHash: 'new-hash',
      passwordSalt: 'new-salt',
    });

    const service = new UserCredentialsService(
      userCredentialsRepository,
      txScope,
      eventPublisher,
      passwordCreationService,
      passwordStorageService,
      policy ?? new UserPasswordPolicy(),
    );

    return {
      service,
      userCredentialsRepository,
      passwordCreationService,
      passwordStorageService,
    };
  }

  describe('setPassword', () => {
    it('should return new credentials when none exist', async () => {
      const { service, userCredentialsRepository } = setup();
      userCredentialsRepository.findActiveByUserId.mockResolvedValue(null);

      const result = await service.setPassword(
        ctx,
        eventContext,
        'user-1',
        'pass',
      );

      expect(result.userId).toBe('user-1');
      expect(result.passwordHash).toBe('new-hash');
      expect(result.passwordSalt).toBe('new-salt');
      expect(result.active).toBe(true);
      expect(userCredentialsRepository.save).toHaveBeenCalled();
    });

    it('should throw when active credentials already exist', async () => {
      const { service, userCredentialsRepository } = setup();
      userCredentialsRepository.findActiveByUserId.mockResolvedValue(
        credentialsMapper.toDomain(mockCredentialEntity),
      );

      await expect(
        service.setPassword(ctx, eventContext, 'user-1', 'pass'),
      ).rejects.toThrow(UserCredentialsAlreadyExistException);
    });
  });

  describe('updatePassword', () => {
    describe('default policy', () => {
      it('should create new credentials when none exist', async () => {
        const { service, userCredentialsRepository, passwordStorageService } =
          setup();
        userCredentialsRepository.findActiveByUserId.mockResolvedValue(null);

        await expect(
          service.updatePassword(ctx, eventContext, 'user-1', 'new-pass'),
        ).resolves.toBeUndefined();

        expect(passwordStorageService.hash).toHaveBeenCalledWith('new-pass');
        expect(userCredentialsRepository.save).toHaveBeenCalled();
      });

      it('should deactivate existing and create new', async () => {
        const { service, userCredentialsRepository } = setup();
        const existing = credentialsMapper.toDomain(mockCredentialEntity);
        userCredentialsRepository.findActiveByUserId.mockResolvedValue(
          existing,
        );

        await service.updatePassword(ctx, eventContext, 'user-1', 'new-pass');

        expect(existing.active).toBe(false);
        expect(userCredentialsRepository.save).toHaveBeenCalledTimes(2);
      });
    });

    describe('requireCurrent policy', () => {
      const policy = new UserPasswordPolicy({ requireCurrent: true });

      it('should throw when no active credentials exist', async () => {
        const { service, userCredentialsRepository } = setup(policy);
        userCredentialsRepository.findActiveByUserId.mockResolvedValue(null);

        await expect(
          service.updatePassword(
            ctx,
            eventContext,
            'user-1',
            'new-pass',
            'current',
          ),
        ).rejects.toThrow(UserPasswordCurrentInvalidException);
      });

      it('should throw when passwordCurrent not provided', async () => {
        const { service, userCredentialsRepository } = setup(policy);
        userCredentialsRepository.findActiveByUserId.mockResolvedValue(
          credentialsMapper.toDomain(mockCredentialEntity),
        );

        await expect(
          service.updatePassword(ctx, eventContext, 'user-1', 'new-pass'),
        ).rejects.toThrow(UserPasswordCurrentInvalidException);
      });

      it('should throw when current password is invalid', async () => {
        const { service, userCredentialsRepository, passwordCreationService } =
          setup(policy);
        userCredentialsRepository.findActiveByUserId.mockResolvedValue(
          credentialsMapper.toDomain(mockCredentialEntity),
        );
        passwordCreationService.validateCurrent.mockResolvedValue(false);

        await expect(
          service.updatePassword(
            ctx,
            eventContext,
            'user-1',
            'new-pass',
            'wrong',
          ),
        ).rejects.toThrow(UserPasswordCurrentInvalidException);
      });

      it('should proceed when current password is valid', async () => {
        const { service, userCredentialsRepository, passwordCreationService } =
          setup(policy);
        userCredentialsRepository.findActiveByUserId.mockResolvedValue(
          credentialsMapper.toDomain(mockCredentialEntity),
        );
        passwordCreationService.validateCurrent.mockResolvedValue(true);

        await expect(
          service.updatePassword(
            ctx,
            eventContext,
            'user-1',
            'new-pass',
            'correct',
          ),
        ).resolves.toBeUndefined();
      });
    });

    describe('reuse restriction policy', () => {
      const policy = new UserPasswordPolicy({ reuseAfterDays: 30 });

      it('should throw when password was previously used', async () => {
        const { service, userCredentialsRepository, passwordCreationService } =
          setup(policy);
        userCredentialsRepository.findActiveByUserId.mockResolvedValue(null);
        userCredentialsRepository.findByUserId.mockResolvedValue([
          credentialsMapper.toDomain(mockCredentialEntity),
        ]);
        passwordCreationService.validateHistory.mockResolvedValue(false);

        await expect(
          service.updatePassword(ctx, eventContext, 'user-1', 'old-pass'),
        ).rejects.toThrow(UserPasswordHistoryViolationException);
      });

      it('should proceed when password is not reused', async () => {
        const { service, userCredentialsRepository, passwordCreationService } =
          setup(policy);
        userCredentialsRepository.findActiveByUserId.mockResolvedValue(null);
        userCredentialsRepository.findByUserId.mockResolvedValue([
          credentialsMapper.toDomain(mockCredentialEntity),
        ]);
        passwordCreationService.validateHistory.mockResolvedValue(true);

        await expect(
          service.updatePassword(ctx, eventContext, 'user-1', 'unique-pass'),
        ).resolves.toBeUndefined();
      });
    });
  });
});
