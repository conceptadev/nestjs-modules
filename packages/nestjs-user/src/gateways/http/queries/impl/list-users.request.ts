import { CrudListQuery } from '@concepta/nestjs-crud';

import { UserInterface } from '../../../../domain/interfaces/user.interface';

export class ListUsersRequest extends CrudListQuery<UserInterface> {}
