import { Observable } from 'rxjs';

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { UserInterface } from '@concepta/nestjs-common';

@Injectable()
export class FakeAuthInterceptorFixture implements NestInterceptor {
  user: UserInterface | undefined;

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    request.user = this.user;
    return next.handle();
  }
}
