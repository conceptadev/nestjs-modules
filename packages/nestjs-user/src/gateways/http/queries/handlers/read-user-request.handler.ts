import { CrudReadHandler } from '@concepta/nestjs-crud';

import { UserInterface } from '../../../../domain/interfaces/user.interface';

export class ReadUserRequestHandler extends CrudReadHandler<UserInterface> {}
