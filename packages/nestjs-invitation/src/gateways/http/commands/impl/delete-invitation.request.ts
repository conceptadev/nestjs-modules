import { CrudDeleteCommand } from '@concepta/nestjs-crud';

import { InvitationInterface } from '../../../../domain/interfaces/invitation.interface';

export class DeleteInvitationRequest extends CrudDeleteCommand<InvitationInterface> {}
