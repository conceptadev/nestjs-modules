import { CrudListQuery } from '@concepta/rockets-crud';

import { InvitationInterface } from '../../../../domain/interfaces/invitation.interface';

export class ListInvitationsRequest extends CrudListQuery<InvitationInterface> {}
