import { CrudListHandler } from '@concepta/rockets-crud';

import { UserInterface } from '../../../../domain/interfaces/user.interface';

export class ListUsersRequestHandler extends CrudListHandler<UserInterface> {}
