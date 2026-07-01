import { CrudDeleteCommand } from '@concepta/nestjs-crud';

import { type InvitationInterface } from '../../../../domain/interfaces/invitation.interface';

export class DeleteInvitationRequest extends CrudDeleteCommand<InvitationInterface> {}
