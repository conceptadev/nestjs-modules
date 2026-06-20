import { OrgCreatableInterface } from './org-creatable.interface';
import { OrgInterface } from './org.interface';

export interface OrgReplaceableInterface
  extends Pick<OrgInterface, 'id'>, OrgCreatableInterface {}
