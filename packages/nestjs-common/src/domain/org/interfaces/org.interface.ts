import { AuditInterface } from '../../../audit/interfaces/audit.interface';
import { ReferenceActiveInterface } from '../../../reference/interfaces/reference-active.interface';
import { ReferenceIdInterface } from '../../../reference/interfaces/reference-id.interface';
import { OrgProfileInterface } from '../../org-profile/interfaces/org-profile.interface';

import { OrgOwnerInterface } from './org-owner.interface';

export interface OrgInterface
  extends
    ReferenceIdInterface,
    ReferenceActiveInterface,
    AuditInterface,
    OrgOwnerInterface {
  /**
   * Name
   */
  name: string;
  orgProfile?: OrgProfileInterface;
}
