import { LiteralObject, UserRelationInterface } from '@concepta/nestjs-common';

export interface InvitationInterface extends UserRelationInterface {
  code: string;
  category: string;
  constraints: LiteralObject | undefined;
  dateAccepted: Date | null;
  dateRevoked: Date | null;
}
