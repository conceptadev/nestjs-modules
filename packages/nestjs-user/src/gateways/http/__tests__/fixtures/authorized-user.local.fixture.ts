import {
  ExecutionContext,
  Injectable,
  PlainLiteralObject,
} from '@nestjs/common';

import { UserEntityInterface } from '@concepta/nestjs-common';
import {
  WithCrudContextInterface,
  CrudLocalInterface,
} from '@concepta/nestjs-crud';

@Injectable()
export class AuthorizedUserLocalFixture
  implements CrudLocalInterface<UserEntityInterface>
{
  static readonly KEY = 'authorizedUser';

  async resolve<Entity extends PlainLiteralObject>(
    context: ExecutionContext,
    _ctx: WithCrudContextInterface<Entity>,
    _locals: Readonly<Record<string, unknown>>,
  ): Promise<UserEntityInterface> {
    const request = context.switchToHttp().getRequest();
    return request.user;
  }

  async transform(): Promise<void> {}
}
