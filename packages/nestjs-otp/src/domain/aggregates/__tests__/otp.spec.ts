import { OtpInterface } from '@concepta/nestjs-common';

import { createMockEventContext } from '../../../__tests__/helpers/mock.helpers';
import { OtpCreatedEvent } from '../../events/otp-created.event';
import { OtpDeactivatedEvent } from '../../events/otp-deactivated.event';
import { Otp, OtpCreateProps } from '../otp';

describe(Otp.name, () => {
  const eventContext = createMockEventContext();

  const validProps: OtpCreateProps = {
    category: 'auth',
    type: 'uuid',
    assigneeId: 'user-1',
    passcode: 'abc-123',
    expiresIn: '1h',
  };

  const validEntity: OtpInterface = {
    id: 'otp-1',
    category: 'auth',
    type: 'uuid',
    assigneeId: 'user-1',
    passcode: 'abc-123',
    expirationDate: new Date('2027-01-01'),
    active: true,
    dateCreated: new Date('2026-01-01'),
    dateUpdated: new Date('2026-01-01'),
    dateDeleted: null,
    version: 1,
  };

  describe('create', () => {
    it('should create an OTP with a generated UUID id', () => {
      const otp = Otp.create(eventContext, validProps);

      expect(otp.id).toBeDefined();
      expect(typeof otp.id).toBe('string');
      expect(otp.id.length).toBeGreaterThan(0);
      expect(otp.category).toBe('auth');
      expect(otp.type).toBe('uuid');
      expect(otp.assigneeId).toBe('user-1');
      expect(otp.passcode).toBe('abc-123');
      expect(otp.active).toBe(true);
      expect(otp.version).toBe(1);
      expect(otp.dateDeleted).toBeNull();
    });

    it('should set expirationDate in the future', () => {
      const before = new Date();
      const otp = Otp.create(eventContext, validProps);
      expect(otp.expirationDate.getTime()).toBeGreaterThan(before.getTime());
    });

    it('should apply OtpCreatedEvent', () => {
      const otp = Otp.create(eventContext, validProps);
      const events = otp.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(OtpCreatedEvent);
    });

    it('should throw for invalid expiresIn', () => {
      expect(() =>
        Otp.create(eventContext, { ...validProps, expiresIn: 'invalid' }),
      ).toThrow();
    });
  });

  describe('createWithId', () => {
    it('should create an OTP with the given id', () => {
      const otp = Otp.createWithId(eventContext, 'custom-id', validProps);

      expect(otp.id).toBe('custom-id');
      expect(otp.category).toBe('auth');
    });

    it('should use the same now for dateCreated and expirationDate', () => {
      const otp = Otp.createWithId(eventContext, 'id-1', {
        ...validProps,
        expiresIn: '1h',
      });

      const diff = otp.expirationDate.getTime() - otp.dateCreated.getTime();
      // 1 hour = 3600000ms
      expect(diff).toBe(3600000);
    });
  });

  describe('toInstance', () => {
    it('should create an Otp from an entity without events', () => {
      const otp = Otp.toInstance(validEntity);

      expect(otp.id).toBe('otp-1');
      expect(otp.category).toBe('auth');
      expect(otp.active).toBe(true);
      expect(otp.getUncommittedEvents()).toHaveLength(0);
    });
  });

  describe('toPlain', () => {
    it('should return a plain copy of the entity', () => {
      const otp = Otp.toInstance(validEntity);
      const plain = otp.toPlain();

      expect(plain).toEqual(validEntity);
      expect(plain).not.toBe(validEntity);
    });
  });

  describe('hydrate', () => {
    it('should replace internal state with new entity data', () => {
      const otp = Otp.toInstance(validEntity);
      const updated: OtpInterface = {
        ...validEntity,
        active: false,
        version: 2,
      };

      otp.hydrate(updated);

      expect(otp.active).toBe(false);
      expect(otp.version).toBe(2);
    });
  });

  describe('deactivate', () => {
    it('should set active to false', () => {
      const otp = Otp.toInstance(validEntity);
      otp.deactivate(eventContext);
      expect(otp.active).toBe(false);
    });

    it('should increment version', () => {
      const otp = Otp.toInstance(validEntity);
      otp.deactivate(eventContext);
      expect(otp.version).toBe(2);
    });

    it('should update dateUpdated', () => {
      const otp = Otp.toInstance(validEntity);
      const before = new Date();
      otp.deactivate(eventContext);
      expect(otp.dateUpdated.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
    });

    it('should apply OtpDeactivatedEvent', () => {
      const otp = Otp.toInstance(validEntity);
      otp.deactivate(eventContext);
      const events = otp.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(OtpDeactivatedEvent);
    });
  });

  describe('isExpired', () => {
    it('should return false when expiration is in the future', () => {
      const otp = Otp.toInstance({
        ...validEntity,
        expirationDate: new Date('2099-01-01'),
      });
      expect(otp.isExpired()).toBe(false);
    });

    it('should return true when expiration is in the past', () => {
      const otp = Otp.toInstance({
        ...validEntity,
        expirationDate: new Date('2020-01-01'),
      });
      expect(otp.isExpired()).toBe(true);
    });

    it('should accept a custom now parameter', () => {
      const otp = Otp.toInstance({
        ...validEntity,
        expirationDate: new Date('2026-06-01'),
      });

      const beforeExpiry = new Date('2026-05-01');
      const afterExpiry = new Date('2026-07-01');

      expect(otp.isExpired(beforeExpiry)).toBe(false);
      expect(otp.isExpired(afterExpiry)).toBe(true);
    });
  });

  describe('getters', () => {
    it('should expose all entity properties', () => {
      const otp = Otp.toInstance(validEntity);

      expect(otp.id).toBe(validEntity.id);
      expect(otp.category).toBe(validEntity.category);
      expect(otp.type).toBe(validEntity.type);
      expect(otp.passcode).toBe(validEntity.passcode);
      expect(otp.assigneeId).toBe(validEntity.assigneeId);
      expect(otp.expirationDate).toEqual(validEntity.expirationDate);
      expect(otp.active).toBe(validEntity.active);
      expect(otp.dateCreated).toEqual(validEntity.dateCreated);
      expect(otp.dateUpdated).toEqual(validEntity.dateUpdated);
      expect(otp.dateDeleted).toBe(validEntity.dateDeleted);
      expect(otp.version).toBe(validEntity.version);
    });
  });
});
