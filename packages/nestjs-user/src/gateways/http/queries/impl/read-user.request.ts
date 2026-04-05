import { CrudReadQuery } from '@concepta/nestjs-crud';

import { UserInterface } from '../../../../domain/interfaces/user.interface';

export class ReadUserRequest extends CrudReadQuery<UserInterface> {}
