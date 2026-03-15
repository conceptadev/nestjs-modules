import { PasswordUpdateInterface } from '@concepta/nestjs-common';
import { CrudUpdateCommand } from '@concepta/nestjs-crud';

export class UpdateUserPasswordRequest extends CrudUpdateCommand<
  PasswordUpdateInterface,
  PasswordUpdateInterface
> {}
