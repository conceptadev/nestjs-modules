import { AssigneeRelationInterface } from '@concepta/nestjs-common';

export interface CacheInterface extends AssigneeRelationInterface {
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
