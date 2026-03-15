import { UserInterface } from '@concepta/nestjs-common';
import { CrudDeleteCommand } from '@concepta/nestjs-crud';

export class DeleteUserRequest extends CrudDeleteCommand<UserInterface> {}
