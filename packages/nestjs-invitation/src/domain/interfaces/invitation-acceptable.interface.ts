import { LiteralObject } from '@concepta/nestjs-common';

export interface InvitationAcceptableInterface {
  passcode: string;
  payload?: LiteralObject;
}
