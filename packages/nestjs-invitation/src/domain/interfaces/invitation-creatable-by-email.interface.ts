import { ReferenceEmailInterface } from '@concepta/nestjs-core';

import { InvitationCreatableInterface } from './invitation-creatable.interface';

export interface InvitationCreatableByEmailInterface
  extends
    Pick<InvitationCreatableInterface, 'category' | 'constraints'>,
    ReferenceEmailInterface {}
