import { UserInterface } from '@concepta/nestjs-common';
import { CrudListHandler } from '@concepta/nestjs-crud';

export class ListUsersRequestHandler extends CrudListHandler<UserInterface> {}
