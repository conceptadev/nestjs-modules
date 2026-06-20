import { CrudCreateCommand } from '@concepta/nestjs-crud';

import { InvitationCreatableInterface } from '../../../../domain/interfaces/invitation-creatable.interface';
import { InvitationInterface } from '../../../../domain/interfaces/invitation.interface';

export class CreateInvitationRequest extends CrudCreateCommand<
  InvitationInterface,
  InvitationCreatableInterface
> {}
