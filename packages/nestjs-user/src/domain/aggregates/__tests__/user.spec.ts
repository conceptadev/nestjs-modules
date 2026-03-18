import { EventContextHost, UserEntityInterface } from '@concepta/nestjs-common';

import { UserMapper } from '../../../infrastructure/persistence/user.mapper';
import { User } from '../user';

const eventContext = EventContextHost.builder().build();
const mapper = new UserMapper();

const mockEntity: UserEntityInterface = {
  id: 'user-1',
  email: 'a@b.com',
  username: 'john',
  active: true,
  dateCreated: new Date('2024-01-01'),
  dateUpdated: new Date('2024-01-01'),
  dateDeleted: null,
  version: 1,
};

describe(User.name, () => {
  describe('create', () => {
    it('should create a user with generated id', () => {
      const user = User.create(eventContext, {
        email: 'a@b.com',
        username: 'john',
      });

      expect(user.id).toBeDefined();
      expect(user.email).toBe('a@b.com');
      expect(user.username).toBe('john');
      expect(user.active).toBe(true);
      expect(user.version).toBe(1);
      expect(user.meta.dateCreated).toBeInstanceOf(Date);
      expect(user.meta.dateUpdated).toBeInstanceOf(Date);
      expect(user.meta.dateDeleted).toBeNull();
    });

    it('should default active to true', () => {
      const user = User.create(eventContext, {
        email: 'a@b.com',
        username: 'john',
      });

      expect(user.active).toBe(true);
    });

    it('should respect explicit active value', () => {
      const user = User.create(eventContext, {
        email: 'a@b.com',
        username: 'john',
        active: false,
      });

      expect(user.active).toBe(false);
    });
  });

  describe('createWithId', () => {
    it('should use the provided id', () => {
      const user = User.createWithId(eventContext, 'custom-id', {
        email: 'a@b.com',
        username: 'john',
      });

      expect(user.id).toBe('custom-id');
    });
  });

  describe('constructor', () => {
    it('should wrap entity with correct getters', () => {
      const user = mapper.toDomain(mockEntity);

      expect(user.id).toBe('user-1');
      expect(user.email).toBe('a@b.com');
      expect(user.username).toBe('john');
      expect(user.active).toBe(true);
      expect(user.version).toBe(1);
    });
  });

  describe('toPlain', () => {
    it('should return a plain copy', () => {
      const user = mapper.toDomain(mockEntity);
      const plain = user.toPlain();

      expect(plain).toEqual(mockEntity);
      expect(plain).not.toBe(mockEntity);
    });
  });

  describe('update', () => {
    it('should merge dto and increment version', () => {
      const user = mapper.toDomain(mockEntity);
      const beforeUpdate = user.meta.dateUpdated;

      user.update(eventContext, { active: false });

      expect(user.active).toBe(false);
      expect(user.version).toBe(2);
      expect(user.meta.dateUpdated.getTime()).toBeGreaterThanOrEqual(
        beforeUpdate.getTime(),
      );
    });

    it('should preserve unchanged fields', () => {
      const user = mapper.toDomain(mockEntity);

      user.update(eventContext, { active: false });

      expect(user.email).toBe('a@b.com');
      expect(user.username).toBe('john');
    });
  });

  describe('remove', () => {
    it('should not throw', () => {
      const user = mapper.toDomain(mockEntity);

      expect(() => user.remove(eventContext)).not.toThrow();
    });
  });
});
