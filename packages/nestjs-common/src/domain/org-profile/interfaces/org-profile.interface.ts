import { AuditInterface } from '../../../audit/interfaces/audit.interface';
import { ReferenceIdInterface } from '../../../reference/interfaces/reference-id.interface';
import { OrgOwnableInterface } from '../../org/interfaces/org-ownable.interface';

export interface OrgProfileInterface
  extends ReferenceIdInterface, AuditInterface, OrgOwnableInterface {}
