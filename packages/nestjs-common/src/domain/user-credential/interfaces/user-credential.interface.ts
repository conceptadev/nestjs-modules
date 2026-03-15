import { AuditInterface } from '../../../audit/interfaces/audit.interface';
import { ReferenceActiveInterface } from '../../../reference/interfaces/reference-active.interface';
import { ReferenceIdInterface } from '../../../reference/interfaces/reference-id.interface';
import { PasswordStorageInterface } from '../../password/interfaces/password-storage.interface';
import { UserOwnableInterface } from '../../user/interfaces/user-ownable.interface';

export interface UserCredentialInterface
  extends ReferenceIdInterface,
    PasswordStorageInterface,
    UserOwnableInterface,
    ReferenceActiveInterface,
    AuditInterface {
  validFrom: Date;
  validTo: Date | null;
}
