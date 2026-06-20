import { OrgProfileInterface } from './org-profile.interface';

export interface OrgProfileCreatableInterface extends Pick<
  OrgProfileInterface,
  'orgId'
> {}
