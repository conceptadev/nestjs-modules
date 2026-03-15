import {
  EventContextHost,
  UserCredentialEntityInterface,
} from '@concepta/nestjs-common';

import { UserCredentials } from '../user-credentials';

const eventContext = EventContextHost.builder().build();

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

describe(UserCredentials.name, () => {
  describe('create', () => {
    it('should create credentials with generated id', () => {
      const creds = UserCredentials.create(eventContext, {
        userId: 'user-1',
        passwordHash: 'hash',
        passwordSalt: 'salt',
      });

      expect(creds.id).toBeDefined();
      expect(creds.userId).toBe('user-1');
      expect(creds.passwordHash).toBe('hash');
      expect(creds.passwordSalt).toBe('salt');
      expect(creds.active).toBe(true);
      expect(creds.version).toBe(1);
      expect(creds.validFrom).toBeInstanceOf(Date);
      expect(creds.validTo).toBeNull();
      expect(creds.dateCreated).toBeInstanceOf(Date);
      expect(creds.dateUpdated).toBeInstanceOf(Date);
      expect(creds.dateDeleted).toBeNull();
    });
  });

  describe('createWithId', () => {
    it('should use the provided id', () => {
      const creds = UserCredentials.createWithId(eventContext, 'custom-id', {
        userId: 'user-1',
        passwordHash: 'hash',
        passwordSalt: 'salt',
      });

      expect(creds.id).toBe('custom-id');
    });
  });

  describe('toInstance', () => {
    it('should wrap entity with correct getters', () => {
      const creds = UserCredentials.toInstance(mockEntity);

      expect(creds.id).toBe('cred-1');
      expect(creds.userId).toBe('user-1');
      expect(creds.passwordHash).toBe('hash');
      expect(creds.passwordSalt).toBe('salt');
      expect(creds.active).toBe(true);
      expect(creds.version).toBe(1);
    });
  });

  describe('toPlain', () => {
    it('should return a plain copy', () => {
      const creds = UserCredentials.toInstance(mockEntity);
      const plain = creds.toPlain();

      expect(plain).toEqual(mockEntity);
      expect(plain).not.toBe(mockEntity);
    });
  });

  describe('hydrate', () => {
    it('should replace internal props', () => {
      const creds = UserCredentials.toInstance(mockEntity);
      const updated: UserCredentialEntityInterface = {
        ...mockEntity,
        version: 5,
        active: false,
      };

      creds.hydrate(updated);

      expect(creds.version).toBe(5);
      expect(creds.active).toBe(false);
    });
  });

  describe('deactivate', () => {
    it('should set active to false and increment version', () => {
      const creds = UserCredentials.toInstance(mockEntity);

      creds.deactivate(eventContext);

      expect(creds.active).toBe(false);
      expect(creds.validTo).toBeInstanceOf(Date);
      expect(creds.version).toBe(2);
    });
  });
});
