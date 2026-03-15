import { randomUUID } from 'crypto';

import { Test, TestingModule } from '@nestjs/testing';

import {
  AppContextHost,
  EventContextHost,
  RepositoryContextInterface,
  UserCredentialEntityInterface,
} from '@concepta/nestjs-common';

import { AppRepoModuleFixture } from '../../../__tests__/fixtures/app-repo.module.fixture';
import { User } from '../../../domain/aggregates/user';
import { UserCredentials } from '../../../domain/aggregates/user-credentials';
import { UserCredentialsRepositoryInterface } from '../../../domain/repositories/user-credentials-repository.interface';
import { UserRepositoryInterface } from '../../../domain/repositories/user-repository.interface';
import {
  USER_CREDENTIALS_REPOSITORY_TOKEN,
  USER_REPOSITORY_TOKEN,
} from '../../../user.constants';
import { UserCredentialsRepository } from '../user-credentials.repository';

describe(UserCredentialsRepository.name + ' (e2e)', () => {
  let moduleFixture: TestingModule;
  let credentialsRepository: UserCredentialsRepositoryInterface;
  let userRepository: UserRepositoryInterface;
  const ctx = new AppContextHost() as unknown as RepositoryContextInterface;
  const eventContext = EventContextHost.builder().build();

  let testUser: User;

  beforeEach(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppRepoModuleFixture],
    }).compile();

    credentialsRepository =
      moduleFixture.get<UserCredentialsRepositoryInterface>(
        USER_CREDENTIALS_REPOSITORY_TOKEN,
      );

    userRepository = moduleFixture.get<UserRepositoryInterface>(
      USER_REPOSITORY_TOKEN,
    );

    testUser = User.create(eventContext, {
      email: 'cred-test@example.com',
      username: 'credtestuser',
    });
    await userRepository.save(ctx, testUser);
  });

  afterEach(async () => {
    await moduleFixture?.close();
  });

  describe('findActiveByUserId', () => {
    it('should return active credentials for user', async () => {
      const creds = UserCredentials.create(eventContext, {
        userId: testUser.id,
        passwordHash: 'hash1',
        passwordSalt: 'salt1',
      });
      await credentialsRepository.save(ctx, creds);

      const found = await credentialsRepository.findActiveByUserId(
        ctx,
        testUser.id,
      );

      expect(found).toBeInstanceOf(UserCredentials);
      expect(found!.userId).toBe(testUser.id);
      expect(found!.active).toBe(true);
    });

    it('should return null when no credentials exist', async () => {
      const found = await credentialsRepository.findActiveByUserId(
        ctx,
        testUser.id,
      );

      expect(found).toBeNull();
    });

    it('should not return inactive credentials', async () => {
      const creds = UserCredentials.create(eventContext, {
        userId: testUser.id,
        passwordHash: 'hash1',
        passwordSalt: 'salt1',
      });
      creds.deactivate(eventContext);
      await credentialsRepository.save(ctx, creds);

      const found = await credentialsRepository.findActiveByUserId(
        ctx,
        testUser.id,
      );

      expect(found).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should return all credentials (active and inactive)', async () => {
      const creds1 = UserCredentials.create(eventContext, {
        userId: testUser.id,
        passwordHash: 'hash1',
        passwordSalt: 'salt1',
      });
      await credentialsRepository.save(ctx, creds1);

      creds1.deactivate(eventContext);
      await credentialsRepository.save(ctx, creds1);

      const creds2 = UserCredentials.create(eventContext, {
        userId: testUser.id,
        passwordHash: 'hash2',
        passwordSalt: 'salt2',
      });
      await credentialsRepository.save(ctx, creds2);

      const found = await credentialsRepository.findByUserId(ctx, testUser.id);

      expect(found).toHaveLength(2);
    });

    it('should return empty array when none exist', async () => {
      const found = await credentialsRepository.findByUserId(ctx, testUser.id);

      expect(found).toHaveLength(0);
    });

    it('should filter by limitDate', async () => {
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const oldEntity: UserCredentialEntityInterface = {
        id: randomUUID(),
        userId: testUser.id,
        passwordHash: 'old-hash',
        passwordSalt: 'old-salt',
        active: false,
        validFrom: sixtyDaysAgo,
        validTo: new Date(sixtyDaysAgo.getTime() + 86400000),
        dateCreated: sixtyDaysAgo,
        dateUpdated: sixtyDaysAgo,
        dateDeleted: null,
        version: 1,
      };
      const oldCreds = UserCredentials.toInstance(oldEntity);
      await credentialsRepository.save(ctx, oldCreds);

      const recentCreds = UserCredentials.create(eventContext, {
        userId: testUser.id,
        passwordHash: 'recent-hash',
        passwordSalt: 'recent-salt',
      });
      await credentialsRepository.save(ctx, recentCreds);

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const found = await credentialsRepository.findByUserId(
        ctx,
        testUser.id,
        thirtyDaysAgo,
      );

      expect(found).toHaveLength(1);
      expect(found[0].id).toBe(recentCreds.id);
    });

    it('should order by validFrom descending', async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const olderEntity: UserCredentialEntityInterface = {
        id: randomUUID(),
        userId: testUser.id,
        passwordHash: 'older-hash',
        passwordSalt: 'older-salt',
        active: false,
        validFrom: thirtyDaysAgo,
        validTo: null,
        dateCreated: thirtyDaysAgo,
        dateUpdated: thirtyDaysAgo,
        dateDeleted: null,
        version: 1,
      };
      const olderCreds = UserCredentials.toInstance(olderEntity);
      await credentialsRepository.save(ctx, olderCreds);

      const newerCreds = UserCredentials.create(eventContext, {
        userId: testUser.id,
        passwordHash: 'newer-hash',
        passwordSalt: 'newer-salt',
      });
      await credentialsRepository.save(ctx, newerCreds);

      const found = await credentialsRepository.findByUserId(ctx, testUser.id);

      expect(found).toHaveLength(2);
      expect(found[0].id).toBe(newerCreds.id);
      expect(found[1].id).toBe(olderCreds.id);
    });
  });

  describe('save', () => {
    it('should persist new credentials', async () => {
      const creds = UserCredentials.create(eventContext, {
        userId: testUser.id,
        passwordHash: 'hash1',
        passwordSalt: 'salt1',
      });

      await credentialsRepository.save(ctx, creds);

      const found = await credentialsRepository.findActiveByUserId(
        ctx,
        testUser.id,
      );
      expect(found).not.toBeNull();
      expect(found!.id).toBe(creds.id);
    });

    it('should update existing credentials', async () => {
      const creds = UserCredentials.create(eventContext, {
        userId: testUser.id,
        passwordHash: 'hash1',
        passwordSalt: 'salt1',
      });
      await credentialsRepository.save(ctx, creds);

      creds.deactivate(eventContext);
      await credentialsRepository.save(ctx, creds);

      const found = await credentialsRepository.findActiveByUserId(
        ctx,
        testUser.id,
      );
      expect(found).toBeNull();
    });
  });
});
