import { CrudReadQuery } from '@concepta/nestjs-crud';

import { InvitationInterface } from '../../../../domain/interfaces/invitation.interface';

export class ReadInvitationRequest extends CrudReadQuery<InvitationInterface> {}
