import { CrudUpdateCommand } from '@concepta/rockets-crud';
import { PasswordUpdateInterface } from '@concepta/rockets-password';

export class UpdateUserPasswordRequest extends CrudUpdateCommand<
  PasswordUpdateInterface,
  PasswordUpdateInterface
> {}
