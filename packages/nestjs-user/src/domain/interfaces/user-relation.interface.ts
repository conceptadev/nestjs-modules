import { ReferenceId } from '@concepta/rockets-app';

/**
 * Belongs to user.
 */
export interface UserRelationInterface<T extends ReferenceId = ReferenceId> {
  userId: T;
}
