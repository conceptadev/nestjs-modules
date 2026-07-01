import { CrudUpdateCommand } from '@concepta/nestjs-crud';

import { type UserUpdatableInterface } from '../../../../domain/interfaces/user-updatable.interface';
import { type UserInterface } from '../../../../domain/interfaces/user.interface';

export class UpdateUserRequest extends CrudUpdateCommand<
  UserInterface,
  UserUpdatableInterface
> {}
