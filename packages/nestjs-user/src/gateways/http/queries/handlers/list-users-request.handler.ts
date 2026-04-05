import { CrudListHandler } from '@concepta/nestjs-crud';

import { UserInterface } from '../../../../domain/interfaces/user.interface';

export class ListUsersRequestHandler extends CrudListHandler<UserInterface> {}
