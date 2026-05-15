import { CrudCreateCommand } from '@concepta/rockets-crud';

import { InvitationCreatableInterface } from '../../../../domain/interfaces/invitation-creatable.interface';
import { InvitationInterface } from '../../../../domain/interfaces/invitation.interface';

export class CreateInvitationRequest extends CrudCreateCommand<
  InvitationInterface,
  InvitationCreatableInterface
> {}
