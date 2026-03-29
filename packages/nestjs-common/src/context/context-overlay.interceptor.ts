import { Observable } from 'rxjs';

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { ContextOverlayInterface } from './interfaces/context-overlay.interface';

@Injectable()
export class ContextOverlayInterceptor implements NestInterceptor {
  constructor(private readonly overlay: ContextOverlayInterface) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    this.overlay.attach(context);

    return next.handle();
  }
}
