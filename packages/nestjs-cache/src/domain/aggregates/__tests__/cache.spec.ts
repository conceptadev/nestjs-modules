import {
  CacheCreatableInterface,
  CacheInterface,
} from '@concepta/nestjs-common';

import { CacheSettingsInterface } from '../../../infrastructure/config/interfaces/cache-settings.interface';
import { Cache } from '../cache';

describe(Cache.name, () => {
  const settings: CacheSettingsInterface = {
    expiresIn: '1h',
  };

  const validCreateDto: CacheCreatableInterface = {
    key: 'testKey',
    type: 'testType',
    data: 'testData',
    assigneeId: 'testAssignee',
    expiresIn: null,
  };

  const mockEntity: CacheInterface = {
    id: 'test-uuid',
    key: 'entityKey',
    type: 'entityType',
    assigneeId: 'entityAssignee',
    data: 'entityData',
    expirationDate: new Date('2026-12-31'),
    dateCreated: new Date('2026-01-01'),
    dateUpdated: new Date('2026-01-01'),
    dateDeleted: null,
    version: 1,
  };

  describe('constructor', () => {
    it('should hydrate all properties from entity', () => {
      const cache = new Cache(mockEntity);

      expect(cache.id).toBe(mockEntity.id);
      expect(cache.key).toBe(mockEntity.key);
      expect(cache.type).toBe(mockEntity.type);
      expect(cache.assigneeId).toBe(mockEntity.assigneeId);
      expect(cache.data).toBe(mockEntity.data);
      expect(cache.expirationDate).toBe(mockEntity.expirationDate);
      expect(cache.dateCreated).toBe(mockEntity.dateCreated);
      expect(cache.dateUpdated).toBe(mockEntity.dateUpdated);
      expect(cache.dateDeleted).toBe(mockEntity.dateDeleted);
      expect(cache.version).toBe(mockEntity.version);
    });
  });

  describe('toInstance', () => {
    it('should create a Cache from a persisted entity', () => {
      const cache = Cache.toInstance(mockEntity);

      expect(cache).toBeInstanceOf(Cache);
      expect(cache.id).toBe(mockEntity.id);
      expect(cache.key).toBe(mockEntity.key);
      expect(cache.data).toBe(mockEntity.data);
    });
  });

  describe('create', () => {
    it('should create a Cache with expirationDate from settings default', () => {
      const cache = Cache.create(validCreateDto, settings);

      expect(cache).toBeInstanceOf(Cache);
      expect(cache.key).toBe('testKey');
      expect(cache.type).toBe('testType');
      expect(cache.data).toBe('testData');
      expect(cache.assigneeId).toBe('testAssignee');
      expect(cache.expirationDate).toBeInstanceOf(Date);
      expect(cache.version).toBe(1);
    });

    it('should use dto expiresIn over settings default', () => {
      const dto: CacheCreatableInterface = {
        ...validCreateDto,
        expiresIn: '2d',
      };

      const cache = Cache.create(dto, settings);

      expect(cache.expirationDate).toBeInstanceOf(Date);
    });

    it('should set expirationDate to null when neither dto nor settings provide expiresIn', () => {
      const noExpirySettings: CacheSettingsInterface = {};

      const cache = Cache.create(validCreateDto, noExpirySettings);

      expect(cache.expirationDate).toBeNull();
    });

    it('should generate a uuid for id', () => {
      const cache = Cache.create(validCreateDto, settings);

      expect(cache.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });
  });

  describe('toPlain', () => {
    it('should return a CacheInterface snapshot', () => {
      const cache = Cache.toInstance(mockEntity);
      const plain = cache.toPlain();

      expect(plain).toEqual(mockEntity);
    });

    it('should return a new object each time', () => {
      const cache = Cache.toInstance(mockEntity);

      expect(cache.toPlain()).not.toBe(cache.toPlain());
    });
  });

  describe('updateData', () => {
    it('should update data and bump version', () => {
      const cache = Cache.toInstance(mockEntity, settings);

      cache.updateData('newData');

      expect(cache.data).toBe('newData');
      expect(cache.version).toBe(mockEntity.version + 1);
    });

    it('should not change expirationDate', () => {
      const cache = Cache.toInstance(mockEntity, settings);
      const originalExpiration = cache.expirationDate;

      cache.updateData('newData');

      expect(cache.expirationDate).toBe(originalExpiration);
    });
  });

  describe('extend', () => {
    it('should update expirationDate and bump version', () => {
      const cache = Cache.toInstance(mockEntity, settings);

      cache.extend('2h');

      expect(cache.expirationDate).toBeInstanceOf(Date);
      expect(cache.version).toBe(mockEntity.version + 1);
    });

    it('should use settings default when no expiresIn provided', () => {
      const cache = Cache.toInstance(mockEntity, settings);

      cache.extend();

      expect(cache.expirationDate).toBeInstanceOf(Date);
      expect(cache.version).toBe(mockEntity.version + 1);
    });
  });
});
