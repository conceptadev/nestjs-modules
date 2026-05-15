import { CrudReadQuery } from '@concepta/rockets-crud';

import { UserInterface } from '../../../../domain/interfaces/user.interface';

export class ReadUserRequest extends CrudReadQuery<UserInterface> {}
