import { CrudListQuery } from '@concepta/rockets-crud';

import { UserInterface } from '../../../../domain/interfaces/user.interface';

export class ListUsersRequest extends CrudListQuery<UserInterface> {}
