import { CrudDeleteCommand } from '@concepta/nestjs-crud';

import { type UserInterface } from '../../../../domain/interfaces/user.interface';

export class DeleteUserRequest extends CrudDeleteCommand<UserInterface> {}
