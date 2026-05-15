import { CrudReadQuery } from '@concepta/rockets-crud';

import { InvitationInterface } from '../../../../domain/interfaces/invitation.interface';

export class ReadInvitationRequest extends CrudReadQuery<InvitationInterface> {}
