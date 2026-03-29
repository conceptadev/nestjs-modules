import { Observable } from 'rxjs';

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { CrudContextOverlay } from './crud-context.overlay';

@Injectable()
export class CrudContextInterceptor implements NestInterceptor {
  constructor(private readonly overlay: CrudContextOverlay) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    this.overlay.attach(context);

    return next.handle();
  }
}
