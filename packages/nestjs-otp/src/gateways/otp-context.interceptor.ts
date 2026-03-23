import { Observable } from 'rxjs';

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';

import { getAppContext } from '@concepta/nestjs-common';

import { OtpContextOverlay } from './otp-context.overlay';

@Injectable()
export class OtpContextInterceptor implements NestInterceptor {
  constructor(private readonly overlay: OtpContextOverlay) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const ctx = getAppContext(request);

    ctx.defineOverlay(this.overlay, context);

    return next.handle();
  }
}
