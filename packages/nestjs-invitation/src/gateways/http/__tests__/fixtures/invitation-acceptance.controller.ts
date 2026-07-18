import { CommandBus } from '@nestjs/cqrs';

import { Ctx } from '@concepta/nestjs-core';
import {
  CrudBody,
  CrudContextInterface,
  CrudController,
  CrudCtx,
  CrudUpdate,
} from '@concepta/nestjs-crud';

import { InvitationAcceptableInterface } from '../../../../domain/interfaces/invitation-acceptable.interface.js';
import { InvitationAcceptDto } from '../../../../infrastructure/dtos/invitation-accept.dto.js';
import { INVITATION_MODULE_DEFAULT_ENTITY_KEY } from '../../../../invitation.constants.js';
import { AcceptInvitationRequestHandler } from '../../commands/handlers/accept-invitation-request.handler.js';
import { AcceptInvitationRequest } from '../../commands/impl/accept-invitation.request.js';

@CrudController({
  path: 'invitation-acceptance',
  entity: INVITATION_MODULE_DEFAULT_ENTITY_KEY,
  request: {
    params: {
      code: { field: 'code', type: 'string' },
    },
  },
})
export class InvitationAcceptanceController {
  constructor(private readonly commandBus: CommandBus) {}

  @CrudUpdate({
    path: ':code',
    command: AcceptInvitationRequest,
    commandHandler: AcceptInvitationRequestHandler,
    request: { body: InvitationAcceptDto },
  })
  async acceptInvitation(
    @Ctx(CrudCtx) context: CrudContextInterface<InvitationAcceptableInterface>,
    @CrudBody() dto: InvitationAcceptDto,
  ): Promise<void> {
    await this.commandBus.execute(new AcceptInvitationRequest(context, dto));
  }
}
