import { ReferenceId } from '../../reference/interfaces/reference.types';

/**
 * Assigned to assignee.
 */
export interface AssigneeRelationInterface<
  T extends ReferenceId = ReferenceId,
> {
  assigneeId: T;
}
