import { Command } from '@nestjs/cqrs';

import { CrudContextInterface } from '@concepta/rockets-crud';

export class SendInvitationRequest extends Command<void> {
  constructor(public readonly context: CrudContextInterface) {
    super();
  }
}
