import { CrudCreateCommand } from '@concepta/nestjs-crud';

import { type InvitationCreatableInterface } from '../../../../domain/interfaces/invitation-creatable.interface';
import { type InvitationInterface } from '../../../../domain/interfaces/invitation.interface';

export class CreateInvitationRequest extends CrudCreateCommand<
  InvitationInterface,
  InvitationCreatableInterface
> {}
