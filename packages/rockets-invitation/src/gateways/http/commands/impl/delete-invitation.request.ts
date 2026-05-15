import { CrudDeleteCommand } from '@concepta/rockets-crud';

import { InvitationInterface } from '../../../../domain/interfaces/invitation.interface';

export class DeleteInvitationRequest extends CrudDeleteCommand<InvitationInterface> {}
