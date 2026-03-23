import { ReferenceEmailInterface } from '@concepta/nestjs-common';

import { InvitationCreatableInterface } from './invitation-creatable.interface';

export interface InvitationCreatableByEmailInterface
  extends Pick<InvitationCreatableInterface, 'category' | 'constraints'>,
    ReferenceEmailInterface {}
