import { ReferenceIdInterface } from '@concepta/nestjs-common';

export interface IdentityInterface {
  provider: string;
  subject: string;
  user: ReferenceIdInterface;
}
