import { CrudUpdateCommand } from '@concepta/rockets-crud';

import { InvitationAcceptableInterface } from '../../../../domain/interfaces/invitation-acceptable.interface';

export class AcceptInvitationRequest extends CrudUpdateCommand<
  InvitationAcceptableInterface,
  InvitationAcceptableInterface
> {}
