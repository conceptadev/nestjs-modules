import { PlainLiteralObject } from '@nestjs/common';

import { ReferenceId } from '@concepta/rockets-app';

export interface InvitationUserRelationInterface<
  T extends ReferenceId = ReferenceId,
> {
  userId: T;
}

export interface InvitationInterface extends InvitationUserRelationInterface {
  code: string;
  category: string;
  constraints: PlainLiteralObject | undefined;
  dateAccepted: Date | null;
  dateRevoked: Date | null;
}
