import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ContextOverlayInterface } from '@concepta/nestjs-common';

import {
  OTP_NAMESPACE_KEY,
  OtpNamespaceOptions,
} from './decorators/otp-namespace.decorator';
import { OtpContextInterface } from './interfaces/otp-context.interface';

@Injectable()
export class OtpContextOverlay
  implements ContextOverlayInterface<'withOtp', OtpContextInterface>
{
  readonly name = 'withOtp';

  constructor(private readonly reflector: Reflector) {}

  resolve(context: ExecutionContext): OtpContextInterface {
    const options = this.reflector.getAllAndOverride<OtpNamespaceOptions>(
      OTP_NAMESPACE_KEY,
      [context.getHandler(), context.getClass()],
    );
    return { namespace: options?.name ?? '' };
  }
}
