import { CrudListQuery } from '@concepta/nestjs-crud';

import { type InvitationInterface } from '../../../../domain/interfaces/invitation.interface';

export class ListInvitationsRequest extends CrudListQuery<InvitationInterface> {}
