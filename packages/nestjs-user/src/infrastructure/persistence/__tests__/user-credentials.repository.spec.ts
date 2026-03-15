import {
  RepositoryContextInterface,
  RepositoryInterface,
  UserCredentialEntityInterface,
} from '@concepta/nestjs-common';

import { UserCredentials } from '../../../domain/aggregates/user-credentials';
import { UserCredentialsRepository } from '../user-credentials.repository';

const ctx = {} as RepositoryContextInterface;

const mockEntity: UserCredentialEntityInterface = {
  id: 'cred-1',
  userId: 'user-1',
  passwordHash: 'hash',
  passwordSalt: 'salt',
  active: true,
  validFrom: new Date('2024-01-01'),
  validTo: null,
  dateCreated: new Date('2024-01-01'),
  dateUpdated: new Date('2024-01-01'),
  dateDeleted: null,
  version: 1,
};

function createMockRepository(): jest.Mocked<
  Pick<
    RepositoryInterface<UserCredentialEntityInterface>,
    'findOne' | 'find' | 'upsert'
  >
> {
  return {
    findOne: jest.fn(),
    find: jest.fn(),
    upsert: jest.fn(),
  };
}

describe(UserCredentialsRepository.name, () => {
  const innerRepo = createMockRepository();
  let repository: UserCredentialsRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new UserCredentialsRepository(
      innerRepo as unknown as RepositoryInterface<UserCredentialEntityInterface>,
    );
  });

  describe('findActiveByUserId', () => {
    it('should return UserCredentials when found', async () => {
      innerRepo.findOne.mockResolvedValue(mockEntity);

      const result = await repository.findActiveByUserId(ctx, 'user-1');

      expect(result).toBeInstanceOf(UserCredentials);
      expect(result!.userId).toBe('user-1');
      expect(result!.active).toBe(true);
    });

    it('should return null when not found', async () => {
      innerRepo.findOne.mockResolvedValue(null);

      const result = await repository.findActiveByUserId(ctx, 'missing');

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should return array of UserCredentials', async () => {
      innerRepo.find.mockResolvedValue([mockEntity]);

      const result = await repository.findByUserId(ctx, 'user-1');

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(UserCredentials);
    });

    it('should return empty array when none found', async () => {
      innerRepo.find.mockResolvedValue([]);

      const result = await repository.findByUserId(ctx, 'user-1');

      expect(result).toHaveLength(0);
    });

    it('should pass limitDate filter when provided', async () => {
      innerRepo.find.mockResolvedValue([]);
      const limitDate = new Date('2024-06-01');

      await repository.findByUserId(ctx, 'user-1', limitDate);

      expect(innerRepo.find).toHaveBeenCalledTimes(1);
      const options = innerRepo.find.mock.calls[0][0];
      expect(options).toBeDefined();
    });

    it('should work without limitDate', async () => {
      innerRepo.find.mockResolvedValue([]);

      await repository.findByUserId(ctx, 'user-1');

      expect(innerRepo.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('save', () => {
    it('should upsert and hydrate the entry', async () => {
      const updatedEntity = { ...mockEntity, version: 2 };
      innerRepo.upsert.mockResolvedValue(updatedEntity);

      const entry = UserCredentials.toInstance(mockEntity);
      await repository.save(ctx, entry);

      expect(innerRepo.upsert).toHaveBeenCalledTimes(1);
      expect(entry.version).toBe(2);
    });
  });
});
