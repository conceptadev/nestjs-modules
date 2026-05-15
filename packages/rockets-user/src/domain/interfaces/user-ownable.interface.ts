import { ReferenceId } from '@concepta/rockets-app';

import { UserInterface } from './user.interface';

export interface UserOwnableInterface {
  userId: ReferenceId;
  user?: UserInterface;
}
