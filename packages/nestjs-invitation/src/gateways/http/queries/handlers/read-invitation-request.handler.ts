import { CrudReadHandler } from '@concepta/nestjs-crud';

import { type InvitationInterface } from '../../../../domain/interfaces/invitation.interface';

export class ReadInvitationRequestHandler extends CrudReadHandler<InvitationInterface> {}
