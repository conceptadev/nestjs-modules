import { LiteralObject, ReferenceId } from '@concepta/nestjs-common';

export interface InvitationUserRelationInterface<
  T extends ReferenceId = ReferenceId,
> {
  userId: T;
}

export interface InvitationInterface extends InvitationUserRelationInterface {
  code: string;
  category: string;
  constraints: LiteralObject | undefined;
  dateAccepted: Date | null;
  dateRevoked: Date | null;
}
