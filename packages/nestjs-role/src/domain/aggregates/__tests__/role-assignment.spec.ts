import {
  createMockEventContext,
  createMockRoleAssignmentEntity,
} from '../../../__tests__/helpers/mock.helpers';
import { RoleAssignedEvent } from '../../events/role-assigned.event';
import { RoleRevokedEvent } from '../../events/role-revoked.event';
import { RoleAssignment } from '../role-assignment';

describe(RoleAssignment.name, () => {
  const eventContext = createMockEventContext();

  describe('create', () => {
    it('should return an instance with correct props', () => {
      const assignment = RoleAssignment.create(eventContext, {
        roleId: 'role-1',
        assigneeId: 'user-1',
      });

      expect(assignment.toPlain()).toEqual({
        id: expect.any(String),
        roleId: 'role-1',
        assigneeId: 'user-1',
        dateCreated: expect.any(Date),
        dateUpdated: expect.any(Date),
        dateDeleted: null,
        version: 1,
      });
    });

    it('should apply a RoleAssignedEvent', () => {
      const assignment = RoleAssignment.create(eventContext, {
        roleId: 'role-1',
        assigneeId: 'user-1',
      });

      const events = assignment.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(RoleAssignedEvent);
    });
  });

  describe('toInstance', () => {
    it('should reconstitute from an entity without applying events', () => {
      const entity = createMockRoleAssignmentEntity();
      const assignment = RoleAssignment.toInstance(entity);

      expect(assignment.toPlain()).toEqual(entity);
      expect(assignment.getUncommittedEvents()).toHaveLength(0);
    });
  });

  describe('toPlain', () => {
    it('should return an immutable copy', () => {
      const entity = createMockRoleAssignmentEntity();
      const assignment = RoleAssignment.toInstance(entity);

      const plain = assignment.toPlain();
      plain.roleId = 'mutated';

      expect(assignment.roleId).toBe(entity.roleId);
    });
  });

  describe('hydrate', () => {
    it('should replace internal state', () => {
      const assignment = RoleAssignment.toInstance(
        createMockRoleAssignmentEntity(),
      );

      const updated = createMockRoleAssignmentEntity({
        roleId: 'new-role',
        assigneeId: 'new-assignee',
        version: 5,
      });
      assignment.hydrate(updated);

      expect(assignment.roleId).toBe('new-role');
      expect(assignment.assigneeId).toBe('new-assignee');
      expect(assignment.version).toBe(5);
    });
  });

  describe('revoke', () => {
    it('should apply a RoleRevokedEvent', () => {
      const assignment = RoleAssignment.toInstance(
        createMockRoleAssignmentEntity(),
      );

      assignment.revoke(eventContext);

      const events = assignment.getUncommittedEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(RoleRevokedEvent);
    });
  });

  describe('immutability', () => {
    it('should not be affected by mutations to the original entity', () => {
      const entity = createMockRoleAssignmentEntity();
      const assignment = RoleAssignment.toInstance(entity);

      entity.roleId = 'mutated';

      expect(assignment.roleId).toBe('test-role-id');
    });
  });
});
