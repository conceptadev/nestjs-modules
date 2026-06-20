import { InvitationInterface } from './invitation.interface';

export interface InvitationCreatableInterface
  extends
    Pick<InvitationInterface, 'category' | 'userId' | 'code'>,
    Partial<Pick<InvitationInterface, 'constraints'>> {}
