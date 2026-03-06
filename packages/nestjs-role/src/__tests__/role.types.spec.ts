import { RoleAssignmentResource, RoleResource } from '../role.types';

describe('Role Types', () => {
  describe('RoleResource enum', () => {
    it('should match', async () => {
      expect(RoleResource.One).toEqual('role');
      expect(RoleResource.Many).toEqual('role-list');
    });
  });
  describe('RoleAssignmentResource enum', () => {
    it('should match', async () => {
      expect(RoleAssignmentResource.One).toEqual('role-assignment');
      expect(RoleAssignmentResource.Many).toEqual('role-assignment-list');
    });
  });
});
