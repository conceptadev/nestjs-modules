import { CacheInterface } from '@concepta/nestjs-common';
import { createMockRepository } from '@concepta/nestjs-common/testing';

import { Cache } from '../../../domain/aggregates/cache';
import { CacheSettingsInterface } from '../../config/interfaces/cache-settings.interface';
import { CacheRepository } from '../cache.repository';
import { CacheNotFoundException } from '../exceptions/cache-not-found.exception';

const mockEntity: CacheInterface = {
  id: 'test-id',
  key: 'test-key',
  type: 'test-type',
  assigneeId: 'test-assignee',
  data: 'test-data',
  expirationDate: new Date('2027-01-01'),
  dateCreated: new Date('2026-01-01'),
  dateUpdated: new Date('2026-01-01'),
  dateDeleted: null,
  version: 1,
};

describe(CacheRepository.name, () => {
  let repo: CacheRepository;
  let mockRepoInterface: ReturnType<
    typeof createMockRepository<CacheInterface>
  >;
  const settings: CacheSettingsInterface = { expiresIn: '1h' };

  beforeEach(() => {
    mockRepoInterface = createMockRepository<CacheInterface>();
    repo = new CacheRepository(mockRepoInterface, settings);
  });

  describe('get', () => {
    it('should return a Cache when entity is found', async () => {
      mockRepoInterface.findOne.mockResolvedValue(mockEntity);

      const result = await repo.get({ id: 'test-id' });

      expect(result).toBeInstanceOf(Cache);
      expect(result.id).toBe('test-id');
    });

    it('should throw CacheNotFoundException when entity is not found', async () => {
      mockRepoInterface.findOne.mockResolvedValue(null);

      await expect(repo.get({ id: 'missing' })).rejects.toThrow(
        CacheNotFoundException,
      );
    });
  });

  describe('findById', () => {
    it('should return a Cache when entity is found', async () => {
      mockRepoInterface.findOne.mockResolvedValue(mockEntity);

      const result = await repo.findById({ id: 'test-id' });

      expect(result).toBeInstanceOf(Cache);
      expect(result!.id).toBe('test-id');
    });

    it('should return null when entity is not found', async () => {
      mockRepoInterface.findOne.mockResolvedValue(null);

      const result = await repo.findById({ id: 'missing' });

      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should return a Cache when entity matches', async () => {
      mockRepoInterface.findOne.mockResolvedValue(mockEntity);

      const result = await repo.findOne({
        key: 'test-key',
        type: 'test-type',
        assigneeId: 'test-assignee',
      });

      expect(result).toBeInstanceOf(Cache);
      expect(result!.key).toBe('test-key');
    });

    it('should return null when no entity matches', async () => {
      mockRepoInterface.findOne.mockResolvedValue(null);

      const result = await repo.findOne({
        key: 'no-match',
        type: 'no-match',
        assigneeId: 'no-match',
      });

      expect(result).toBeNull();
    });
  });

  describe('findAllByAssignee', () => {
    it('should return array of Cache instances', async () => {
      mockRepoInterface.find.mockResolvedValue([mockEntity, mockEntity]);

      const result = await repo.findAllByAssignee({
        assigneeId: 'test-assignee',
      });

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Cache);
    });

    it('should return empty array when no matches', async () => {
      mockRepoInterface.find.mockResolvedValue([]);

      const result = await repo.findAllByAssignee({
        assigneeId: 'no-match',
      });

      expect(result).toEqual([]);
    });
  });

  describe('save', () => {
    it('should upsert and hydrate the cache', async () => {
      const updatedEntity = { ...mockEntity, version: 2 };
      mockRepoInterface.upsert.mockResolvedValue(updatedEntity);

      const cache = Cache.toInstance(mockEntity, settings);
      await repo.save({ cache });

      expect(cache.version).toBe(2);
    });
  });

  describe('remove', () => {
    it('should delete the cache entity', async () => {
      mockRepoInterface.delete.mockResolvedValue(undefined as never);

      const cache = Cache.toInstance(mockEntity, settings);
      await expect(repo.remove({ cache })).resolves.toBeUndefined();
    });
  });

  describe('softRemove', () => {
    it('should soft delete the cache entity', async () => {
      mockRepoInterface.softDelete.mockResolvedValue(undefined as never);

      const cache = Cache.toInstance(mockEntity, settings);
      await expect(repo.softRemove({ cache })).resolves.toBeUndefined();
    });
  });
});
