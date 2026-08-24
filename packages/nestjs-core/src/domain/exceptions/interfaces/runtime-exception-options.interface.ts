import { type HttpStatus } from '@nestjs/common';

export interface RuntimeExceptionOptions {
  httpStatus?: HttpStatus;
  message?: string;
  messageParams?: (string | number)[];
  safeMessage?: string;
  safeMessageParams?: (string | number)[];
  /**
   * The original error, if any. Mapped onto both the native `cause` (via
   * `HttpException`'s `options.cause`) and `context.originalError`.
   */
  originalError?: unknown;
}
