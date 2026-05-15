import { CrudCreateCommand } from '@concepta/rockets-crud';

import { InvitationCreatableByEmailInterface } from '../../../../domain/interfaces/invitation-creatable-by-email.interface';
import { InvitationInterface } from '../../../../domain/interfaces/invitation.interface';

export class CreateInvitationByEmailRequest extends CrudCreateCommand<
  InvitationInterface,
  InvitationCreatableByEmailInterface
> {}
