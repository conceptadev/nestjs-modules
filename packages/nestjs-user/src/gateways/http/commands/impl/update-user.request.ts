import { UserInterface, UserUpdatableInterface } from '@concepta/nestjs-common';
import { CrudUpdateCommand } from '@concepta/nestjs-crud';

export class UpdateUserRequest extends CrudUpdateCommand<
  UserInterface,
  UserUpdatableInterface
> {}
