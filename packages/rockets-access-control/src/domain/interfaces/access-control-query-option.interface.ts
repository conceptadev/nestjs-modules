import { Type } from '@nestjs/common';

import { CanAccess } from '../policies/can-access.policy';

export interface AccessControlQueryOptionInterface {
  /**
   * Service used for advanced validation
   */
  service: Type<CanAccess>;
}
