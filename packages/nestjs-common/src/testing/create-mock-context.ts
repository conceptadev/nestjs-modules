/**
 * Create a mock repository context for unit testing.
 *
 * @param entity - The entity key (e.g., 'UserCache', 'userOtp', 'Role')
 */
export function createMockContext(entity: string): Record<string, unknown> {
  return { entity };
}
