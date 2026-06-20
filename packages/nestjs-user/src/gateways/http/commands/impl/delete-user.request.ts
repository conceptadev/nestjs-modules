import { CrudDeleteCommand } from '@concepta/nestjs-crud';

import { UserInterface } from '../../../../domain/interfaces/user.interface';

export class DeleteUserRequest extends CrudDeleteCommand<UserInterface> {}
