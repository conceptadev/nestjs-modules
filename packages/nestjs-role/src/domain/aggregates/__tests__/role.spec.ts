import {
  createMockEventContext,
  createMockRoleEntity,
} from '../../../__tests__/helpers/mock.helpers';
import { RoleCreatedEvent } from '../../events/role-created.event';
import { RoleReplacedEvent } from '../../events/role-replaced.event';
import { RoleUpdatedEvent } from '../../events/role-updated.event';
import { Role } from '../role';

describe(Role.name, () => {
  const eventContext = createMockEventContext();

  describe('createWithId', () => {
    it('should return a Role with the given id and props', () => {
      const role = Role.createWithId(eventContext, 'my-id', {
        name: 'Admin',
        description: 'Administrator',
      });

      expect(role.toPlain()).toEqual({
        id: 'my-id',
        name: 'Admin',
        description: 'Administrator',
        dateCreated: expect.any(Date),
        dateUpdated: expect.any(Date),
        dateDeleted: null,
        version: 1,
      });
    });

    it('should apply a RoleCreatedEvent', () => {
      const role = Role.createWithId(eventContext, 'my-id', {
        name: 'Admin',
        description: 'Administrator',
      });

      const events = role.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(RoleCreatedEvent);
    });
  });

  describe('create', () => {
    it('should generate a UUID for the id', () => {
      const role = Role.create(eventContext, {
        name: 'Editor',
        description: 'Content editor',
      });

      expect(role.id).toEqual(expect.any(String));
      expect(role.id.length).toBeGreaterThan(0);
    });
  });

  describe('toInstance', () => {
    it('should reconstitute from an entity without applying events', () => {
      const entity = createMockRoleEntity();
      const role = Role.toInstance(entity);

      expect(role.toPlain()).toEqual(entity);
      expect(role.getUncommittedEvents()).toHaveLength(0);
    });
  });

  describe('toPlain', () => {
    it('should return an immutable copy of the entity', () => {
      const entity = createMockRoleEntity();
      const role = Role.toInstance(entity);

      const plain = role.toPlain();
      plain.name = 'mutated';

      expect(role.name).toBe(entity.name);
    });
  });

  describe('hydrate', () => {
    it('should replace internal state', () => {
      const role = Role.toInstance(createMockRoleEntity());

      const updated = createMockRoleEntity({
        name: 'New Name',
        description: 'New Description',
        version: 2,
      });
      role.hydrate(updated);

      expect(role.name).toBe('New Name');
      expect(role.description).toBe('New Description');
      expect(role.version).toBe(2);
    });
  });

  describe('update', () => {
    it('should merge partial props and bump version', () => {
      const role = Role.toInstance(createMockRoleEntity({ version: 1 }));

      role.update(eventContext, { name: 'Updated Name' });

      expect(role.name).toBe('Updated Name');
      expect(role.description).toBe('A test role');
      expect(role.version).toBe(2);
    });

    it('should update dateUpdated', () => {
      const originalDate = new Date('2020-01-01');
      const role = Role.toInstance(
        createMockRoleEntity({ dateUpdated: originalDate }),
      );

      role.update(eventContext, { name: 'Updated' });

      expect(role.dateUpdated.getTime()).toBeGreaterThan(
        originalDate.getTime(),
      );
    });

    it('should apply a RoleUpdatedEvent', () => {
      const role = Role.toInstance(createMockRoleEntity());

      role.update(eventContext, { name: 'Updated' });

      const events = role.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(RoleUpdatedEvent);
    });
  });

  describe('replace', () => {
    it('should set name and description, bump version', () => {
      const role = Role.toInstance(createMockRoleEntity({ version: 3 }));

      role.replace(eventContext, {
        name: 'Replaced',
        description: 'Replaced desc',
      });

      expect(role.name).toBe('Replaced');
      expect(role.description).toBe('Replaced desc');
      expect(role.version).toBe(4);
    });

    it('should apply a RoleReplacedEvent', () => {
      const role = Role.toInstance(createMockRoleEntity());

      role.replace(eventContext, { name: 'R', description: 'D' });

      const events = role.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(RoleReplacedEvent);
    });
  });

  describe('immutability', () => {
    it('should not be affected by mutations to the original entity', () => {
      const entity = createMockRoleEntity();
      const role = Role.toInstance(entity);

      entity.name = 'mutated';

      expect(role.name).toBe('Test Role');
    });
  });
});
