import { CrudReadHandler } from '@concepta/rockets-crud';

import { InvitationInterface } from '../../../../domain/interfaces/invitation.interface';

export class ReadInvitationRequestHandler extends CrudReadHandler<InvitationInterface> {}
