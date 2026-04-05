import { PasswordPlainInterface } from '@concepta/nestjs-common';

import { UserInterface } from './user.interface';

export interface UserCreatableInterface
  extends Pick<UserInterface, 'username' | 'email'>,
    Partial<Pick<UserInterface, 'active'>>,
    Partial<PasswordPlainInterface> {}
