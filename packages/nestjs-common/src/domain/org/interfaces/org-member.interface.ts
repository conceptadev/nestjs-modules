import { AuditInterface } from '../../../audit/interfaces/audit.interface';
import { ReferenceActiveInterface } from '../../../reference/interfaces/reference-active.interface';
import { ReferenceIdInterface } from '../../../reference/interfaces/reference-id.interface';
import { ReferenceId } from '../../../reference/interfaces/reference.types';

import { OrgOwnableInterface } from './org-ownable.interface';

export interface OrgMemberOwnableInterface {
  userId: ReferenceId;
}

export interface OrgMemberInterface
  extends ReferenceIdInterface,
    ReferenceActiveInterface,
    OrgOwnableInterface,
    OrgMemberOwnableInterface,
    AuditInterface {}
