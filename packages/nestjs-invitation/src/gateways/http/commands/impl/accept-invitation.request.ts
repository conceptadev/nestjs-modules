import { CrudUpdateCommand } from '@concepta/nestjs-crud';

import { InvitationAcceptableInterface } from '../../../../domain/interfaces/invitation-acceptable.interface';

export class AcceptInvitationRequest extends CrudUpdateCommand<
  InvitationAcceptableInterface,
  InvitationAcceptableInterface
> {}
