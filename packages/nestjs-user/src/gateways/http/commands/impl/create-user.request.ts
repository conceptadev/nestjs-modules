import { CrudCreateCommand } from '@concepta/nestjs-crud';

import { type UserCreatableInterface } from '../../../../domain/interfaces/user-creatable.interface';
import { type UserInterface } from '../../../../domain/interfaces/user.interface';

export class CreateUserRequest extends CrudCreateCommand<
  UserInterface,
  UserCreatableInterface
> {}
