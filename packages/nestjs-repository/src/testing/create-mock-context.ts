import { RepositoryContextInterface } from '../context/interfaces/repository-context.interface';

/**
 * Create a mock RepositoryContextInterface for unit testing.
 *
 * @param entity - The entity key (e.g., 'UserCache', 'userOtp', 'Role')
 */
export function createMockContext(entity: string): RepositoryContextInterface {
  return { entity } as RepositoryContextInterface;
}
