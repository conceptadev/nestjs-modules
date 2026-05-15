import { CrudCreateCommand } from '@concepta/rockets-crud';

import { UserCreatableInterface } from '../../../../domain/interfaces/user-creatable.interface';
import { UserInterface } from '../../../../domain/interfaces/user.interface';

export class CreateUserRequest extends CrudCreateCommand<
  UserInterface,
  UserCreatableInterface
> {}
