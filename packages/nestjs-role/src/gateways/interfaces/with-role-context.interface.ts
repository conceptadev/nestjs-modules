import { RoleContextInterface } from './role-context.interface';

export interface WithRoleContextInterface {
  withRole(): RoleContextInterface;
}
