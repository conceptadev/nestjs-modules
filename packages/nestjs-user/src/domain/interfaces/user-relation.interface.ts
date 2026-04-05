import { ReferenceId } from '@concepta/nestjs-common';

/**
 * Belongs to user.
 */
export interface UserRelationInterface<T extends ReferenceId = ReferenceId> {
  userId: T;
}
