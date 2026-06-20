import { CrudUpdateCommand } from '@concepta/nestjs-crud';

import { UserUpdatableInterface } from '../../../../domain/interfaces/user-updatable.interface';
import { UserInterface } from '../../../../domain/interfaces/user.interface';

export class UpdateUserRequest extends CrudUpdateCommand<
  UserInterface,
  UserUpdatableInterface
> {}
