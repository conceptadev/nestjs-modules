import { ReferenceId } from '@concepta/nestjs-common';

import { UserInterface } from './user.interface';

export interface UserOwnableInterface {
  userId: ReferenceId;
  user?: UserInterface;
}
