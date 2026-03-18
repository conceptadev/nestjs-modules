import {
  RepositoryContextInterface,
  RepositoryInterface,
  UserEntityInterface,
} from '@concepta/nestjs-common';

import { createMockUserEntity } from '../../../__tests__/helpers/mock.helpers';
import { User } from '../../../domain/aggregates/user';
import { UserMapper } from '../user.mapper';
import { UserRepository } from '../user.repository';

const userMapper = new UserMapper();

const ctx = {} as RepositoryContextInterface;

const mockEntity = createMockUserEntity();

function createMockRepository(): jest.Mocked<
  Pick<
    RepositoryInterface<UserEntityInterface>,
    'findOne' | 'upsert' | 'delete'
  >
> {
  return {
    findOne: jest.fn(),
    upsert: jest.fn(),
    delete: jest.fn(),
  };
}

describe(UserRepository.name, () => {
  const innerRepo = createMockRepository();
  let repository: UserRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new UserRepository(
      innerRepo as unknown as RepositoryInterface<UserEntityInterface>,
      new UserMapper(),
    );
  });

  describe('get', () => {
    it('should return User when found', async () => {
      innerRepo.findOne.mockResolvedValue(mockEntity);

      const result = await repository.get(ctx, 'user-1');

      expect(result).toBeInstanceOf(User);
      expect(result!.id).toBe('user-1');
      expect(result!.email).toBe('a@b.com');
    });

    it('should return null when not found', async () => {
      innerRepo.findOne.mockResolvedValue(null);

      const result = await repository.get(ctx, 'missing');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return User when found', async () => {
      innerRepo.findOne.mockResolvedValue(mockEntity);

      const result = await repository.findByEmail(ctx, 'a@b.com');

      expect(result).toBeInstanceOf(User);
      expect(result!.email).toBe('a@b.com');
    });

    it('should return null when not found', async () => {
      innerRepo.findOne.mockResolvedValue(null);

      const result = await repository.findByEmail(ctx, 'missing@b.com');

      expect(result).toBeNull();
    });
  });

  describe('findByUsername', () => {
    it('should return User when found', async () => {
      innerRepo.findOne.mockResolvedValue(mockEntity);

      const result = await repository.findByUsername(ctx, 'john');

      expect(result).toBeInstanceOf(User);
      expect(result!.username).toBe('john');
    });

    it('should return null when not found', async () => {
      innerRepo.findOne.mockResolvedValue(null);

      const result = await repository.findByUsername(ctx, 'missing');

      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('should stamp and upsert the plain entity', async () => {
      innerRepo.upsert.mockResolvedValue(mockEntity);

      const user = userMapper.toDomain(mockEntity);
      const stampSpy = jest.spyOn(user, 'stampUpdated');

      await repository.save(ctx, user);

      expect(stampSpy).toHaveBeenCalledTimes(1);
      expect(innerRepo.upsert).toHaveBeenCalledWith(
        userMapper.toPersistence(user),
        { ctx },
      );
    });
  });

  describe('remove', () => {
    it('should delete the user', async () => {
      innerRepo.delete.mockResolvedValue(mockEntity);

      const user = userMapper.toDomain(mockEntity);
      await repository.remove(ctx, user);

      expect(innerRepo.delete).toHaveBeenCalledTimes(1);
    });
  });
});
