import {
  ByIdInterface,
  CreateOneInterface,
  ReferenceId,
  RemoveOneInterface,
  OrgMemberEntityInterface,
} from '@concepta/nestjs-common';

import { OrgMemberCreatableInterface } from './org-member-creatable.interface';

export interface OrgMemberModelServiceInterface
  extends
    ByIdInterface<ReferenceId, OrgMemberEntityInterface>,
    CreateOneInterface<OrgMemberCreatableInterface, OrgMemberEntityInterface>,
    RemoveOneInterface<
      Pick<OrgMemberEntityInterface, 'id'>,
      OrgMemberEntityInterface
    > {}
