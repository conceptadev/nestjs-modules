import { UserInterface } from '@concepta/nestjs-common';
import { CrudListQuery } from '@concepta/nestjs-crud';

export class ListUsersRequest extends CrudListQuery<UserInterface> {}
