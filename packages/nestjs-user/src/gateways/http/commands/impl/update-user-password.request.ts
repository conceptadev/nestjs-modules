import { CrudUpdateCommand } from '@concepta/nestjs-crud';
import { PasswordUpdateInterface } from '@concepta/nestjs-password';

export class UpdateUserPasswordRequest extends CrudUpdateCommand<
  PasswordUpdateInterface,
  PasswordUpdateInterface
> {}
