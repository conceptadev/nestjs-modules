import { type ReferenceEmailInterface } from '@concepta/nestjs-core';

import { type InvitationCreatableInterface } from './invitation-creatable.interface';

export interface InvitationCreatableByEmailInterface
  extends
    Pick<InvitationCreatableInterface, 'category' | 'constraints'>,
    ReferenceEmailInterface {}
