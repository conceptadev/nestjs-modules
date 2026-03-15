import { UserCreatableInterface, UserInterface } from '@concepta/nestjs-common';
import { CrudCreateCommand } from '@concepta/nestjs-crud';

export class CreateUserRequest extends CrudCreateCommand<
  UserInterface,
  UserCreatableInterface
> {}
