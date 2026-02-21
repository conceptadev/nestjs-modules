import { AuditInterface } from '../../../audit/interfaces/audit.interface';
import { ReferenceIdInterface } from '../../../reference/interfaces/reference-id.interface';
import { AssigneeRelationInterface } from '../../assignee/interfaces/assignee-relation.interface';

export interface CacheInterface
  extends ReferenceIdInterface,
    AssigneeRelationInterface,
    AuditInterface {
  /**
   * key to be used as reference for the cache data
   */
  key: string;

  /**
   * Type of the cache
   */
  type: string;

  /**
   * data of the cache
   */
  data: string | null;

  /**
   * Date it will expire
   */
  expirationDate: Date | null;
}
