import { CacheInterface, Where } from '@concepta/nestjs-common';
import { createMockRepository } from '@concepta/nestjs-common/testing';

import { createMockContext } from '../../../__tests__/helpers/mock.helpers';
import { Cache } from '../../../domain/aggregates/cache';
import { CacheSettingsInterface } from '../../config/interfaces/cache-settings.interface';
import { CacheRepository } from '../cache.repository';

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
  const w = Where.for<CacheInterface>();
  const ctx = createMockContext();

  beforeEach(() => {
    mockRepoInterface = createMockRepository<CacheInterface>();
    repo = new CacheRepository(mockRepoInterface, settings);
  });

  describe('get', () => {
    it('should query by id and return a Cache', async () => {
      mockRepoInterface.findOne.mockResolvedValue(mockEntity);

      const result = await repo.get(ctx, 'test-id');

      expect(result).toBeInstanceOf(Cache);
      expect(result!.id).toBe('test-id');
      expect(mockRepoInterface.findOne).toHaveBeenCalledWith({
        where: w.eq('id', 'test-id'),
        ctx,
      });
    });

    it('should return null when entity is not found', async () => {
      mockRepoInterface.findOne.mockResolvedValue(null);

      const result = await repo.get(ctx, 'missing');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should query by id and return a Cache', async () => {
      mockRepoInterface.findOne.mockResolvedValue(mockEntity);

      const result = await repo.findById(ctx, 'test-id');

      expect(result).toBeInstanceOf(Cache);
      expect(result!.id).toBe('test-id');
      expect(mockRepoInterface.findOne).toHaveBeenCalledWith({
        where: w.eq('id', 'test-id'),
        ctx,
      });
    });

    it('should return null when entity is not found', async () => {
      mockRepoInterface.findOne.mockResolvedValue(null);

      const result = await repo.findById(ctx, 'missing');

      expect(result).toBeNull();
    });
  });

  describe('findOne', () => {
    it('should query by key, type, and assigneeId', async () => {
      mockRepoInterface.findOne.mockResolvedValue(mockEntity);

      const result = await repo.findOne(ctx, {
        key: 'test-key',
        type: 'test-type',
        assigneeId: 'test-assignee',
      });

      expect(result).toBeInstanceOf(Cache);
      expect(result!.key).toBe('test-key');
      expect(mockRepoInterface.findOne).toHaveBeenCalledWith({
        where: w.and(
          w.eq('key', 'test-key'),
          w.eq('type', 'test-type'),
          w.eq('assigneeId', 'test-assignee'),
        ),
        ctx,
      });
    });

    it('should return null when no entity matches', async () => {
      mockRepoInterface.findOne.mockResolvedValue(null);

      const result = await repo.findOne(ctx, {
        key: 'no-match',
        type: 'no-match',
        assigneeId: 'no-match',
      });

      expect(result).toBeNull();
    });
  });

  describe('findAllByAssignee', () => {
    it('should query by assigneeId', async () => {
      mockRepoInterface.find.mockResolvedValue([mockEntity, mockEntity]);

      const result = await repo.findAllByAssignee(ctx, 'test-assignee');

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Cache);
      expect(mockRepoInterface.find).toHaveBeenCalledWith({
        where: w.eq('assigneeId', 'test-assignee'),
        ctx,
      });
    });

    it('should return empty array when no matches', async () => {
      mockRepoInterface.find.mockResolvedValue([]);

      const result = await repo.findAllByAssignee(ctx, 'no-match');

      expect(result).toEqual([]);
    });
  });

  describe('save', () => {
    it('should upsert the plain entity and hydrate the cache', async () => {
      const updatedEntity = { ...mockEntity, version: 2 };
      mockRepoInterface.upsert.mockResolvedValue(updatedEntity);

      const cache = Cache.toInstance(mockEntity, settings);
      const plainBeforeSave = cache.toPlain();
      await repo.save(ctx, cache);

      expect(mockRepoInterface.upsert).toHaveBeenCalledWith(plainBeforeSave, {
        ctx,
      });
      expect(cache.version).toBe(2);
    });
  });

  describe('remove', () => {
    it('should delete the plain entity', async () => {
      mockRepoInterface.delete.mockResolvedValue(undefined as never);

      const cache = Cache.toInstance(mockEntity, settings);
      await repo.remove(ctx, cache);

      expect(mockRepoInterface.delete).toHaveBeenCalledWith(cache.toPlain(), {
        ctx,
      });
    });
  });

  describe('removeAllByAssignee', () => {
    it('should find and delete all caches for assignee in a single batch', async () => {
      mockRepoInterface.find.mockResolvedValue([mockEntity]);
      mockRepoInterface.deleteMany.mockResolvedValue([mockEntity]);

      await repo.removeAllByAssignee(ctx, 'test-assignee');

      expect(mockRepoInterface.find).toHaveBeenCalledWith({
        where: w.eq('assigneeId', 'test-assignee'),
        ctx,
      });
      const expectedPlain = Cache.toInstance(mockEntity, settings).toPlain();
      expect(mockRepoInterface.deleteMany).toHaveBeenCalledWith(
        [expectedPlain],
        { ctx },
      );
    });

    it('should call deleteMany with empty array when no caches found', async () => {
      mockRepoInterface.find.mockResolvedValue([]);
      mockRepoInterface.deleteMany.mockResolvedValue([]);

      await repo.removeAllByAssignee(ctx, 'none');

      expect(mockRepoInterface.deleteMany).toHaveBeenCalledWith([], { ctx });
    });
  });

  describe('softRemove', () => {
    it('should soft delete the plain entity', async () => {
      mockRepoInterface.softDelete.mockResolvedValue(undefined as never);

      const cache = Cache.toInstance(mockEntity, settings);
      await repo.softRemove(ctx, cache);

      expect(mockRepoInterface.softDelete).toHaveBeenCalledWith(
        cache.toPlain(),
        { ctx },
      );
    });
  });
});
