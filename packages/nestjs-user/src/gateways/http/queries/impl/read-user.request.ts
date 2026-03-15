import { UserInterface } from '@concepta/nestjs-common';
import { CrudReadQuery } from '@concepta/nestjs-crud';

export class ReadUserRequest extends CrudReadQuery<UserInterface> {}
