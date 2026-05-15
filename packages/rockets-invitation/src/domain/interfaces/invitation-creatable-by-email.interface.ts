import { ReferenceEmailInterface } from '@concepta/rockets-app';

import { InvitationCreatableInterface } from './invitation-creatable.interface';

export interface InvitationCreatableByEmailInterface
  extends Pick<InvitationCreatableInterface, 'category' | 'constraints'>,
    ReferenceEmailInterface {}
