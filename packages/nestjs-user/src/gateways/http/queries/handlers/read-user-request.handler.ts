import { UserInterface } from '@concepta/nestjs-common';
import { CrudReadHandler } from '@concepta/nestjs-crud';

export class ReadUserRequestHandler extends CrudReadHandler<UserInterface> {}
