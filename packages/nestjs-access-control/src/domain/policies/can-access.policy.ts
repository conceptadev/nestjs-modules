import { type AccessControlContextInterface } from '../interfaces/access-control-context.interface';

export interface CanAccess {
  canAccess(context: AccessControlContextInterface): Promise<boolean>;
}
