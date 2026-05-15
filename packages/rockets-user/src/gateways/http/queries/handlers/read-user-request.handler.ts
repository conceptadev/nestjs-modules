import { CrudReadHandler } from '@concepta/rockets-crud';

import { UserInterface } from '../../../../domain/interfaces/user.interface';

export class ReadUserRequestHandler extends CrudReadHandler<UserInterface> {}
