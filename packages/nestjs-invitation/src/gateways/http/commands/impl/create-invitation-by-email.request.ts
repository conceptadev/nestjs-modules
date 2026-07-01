import { CrudCreateCommand } from '@concepta/nestjs-crud';

import { type InvitationCreatableByEmailInterface } from '../../../../domain/interfaces/invitation-creatable-by-email.interface';
import { type InvitationInterface } from '../../../../domain/interfaces/invitation.interface';

export class CreateInvitationByEmailRequest extends CrudCreateCommand<
  InvitationInterface,
  InvitationCreatableByEmailInterface
> {}
