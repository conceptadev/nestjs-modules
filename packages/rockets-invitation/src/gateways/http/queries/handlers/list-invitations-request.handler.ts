import { CrudListHandler } from '@concepta/rockets-crud';

import { InvitationInterface } from '../../../../domain/interfaces/invitation.interface';

export class ListInvitationsRequestHandler extends CrudListHandler<InvitationInterface> {}
