import { RuntimeExceptionOptions } from '../../../domain/exceptions/interfaces/runtime-exception-options.interface';
import { RuntimeException } from '../../../domain/exceptions/runtime.exception';

export class OverlayNotDefinedException extends RuntimeException {
  constructor(name: string, options?: RuntimeExceptionOptions) {
    super({
      message: `Overlay "${name}" is not defined on the context. Ensure the corresponding interceptor is applied to this route.`,
      ...options,
    });

    this.errorCode = 'OVERLAY_NOT_DEFINED';
  }
}
