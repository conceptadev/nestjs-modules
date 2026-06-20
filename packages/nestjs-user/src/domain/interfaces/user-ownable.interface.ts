import { ReferenceId } from '@concepta/nestjs-core';

import { UserInterface } from './user.interface';

export interface UserOwnableInterface {
  userId: ReferenceId;
  user?: UserInterface;
}
