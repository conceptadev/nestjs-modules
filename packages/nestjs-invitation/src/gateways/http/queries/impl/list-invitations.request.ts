import { CrudListQuery } from '@concepta/nestjs-crud';

import { InvitationInterface } from '../../../../domain/interfaces/invitation.interface';

export class ListInvitationsRequest extends CrudListQuery<InvitationInterface> {}
