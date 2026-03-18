import { ExecutionContext, Injectable } from '@nestjs/common';

import { UserEntityInterface } from '@concepta/nestjs-common';
import {
  CrudContextInterface,
  CrudLocalInterface,
} from '@concepta/nestjs-crud';

@Injectable()
export class AuthorizedUserLocalFixture
  implements CrudLocalInterface<UserEntityInterface>
{
  static readonly KEY = 'authorizedUser';

  async resolve(
    context: ExecutionContext,
    _crudContext: CrudContextInterface,
  ): Promise<UserEntityInterface> {
    const request = context.switchToHttp().getRequest();
    return request.user;
  }

  async transform(): Promise<void> {}
}
