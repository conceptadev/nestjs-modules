import { ReferenceIdInterface } from '@concepta/rockets-app';

export interface IdentityInterface {
  provider: string;
  subject: string;
  user: ReferenceIdInterface;
}
