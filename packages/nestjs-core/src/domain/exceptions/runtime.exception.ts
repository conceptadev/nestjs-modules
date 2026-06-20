import { format } from 'util';

import { HttpStatus } from '@nestjs/common';

import { mapNonErrorToException } from '../../infrastructure/utils/map-non-error-to-exception.util';

import { RuntimeExceptionContext } from './exception.types';
import { RuntimeExceptionOptions } from './interfaces/runtime-exception-options.interface';
import { RuntimeExceptionInterface } from './interfaces/runtime-exception.interface';

export class RuntimeException
  extends Error
  implements RuntimeExceptionInterface
{
  private _errorCode = 'RUNTIME_EXCEPTION';
  readonly httpStatus: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
  readonly safeMessage?: string;
  public context: RuntimeExceptionContext = {};

  constructor(
    message?: string,
    options?: Omit<RuntimeExceptionOptions, 'message'>,
  );
  constructor(options?: RuntimeExceptionOptions);

  constructor(
    messageOrOptions?: string | RuntimeExceptionOptions,
    options?: Omit<RuntimeExceptionOptions, 'message'>,
  ) {
    let message: string | undefined;

    let finalOptions:
      | RuntimeExceptionOptions
      | Omit<RuntimeExceptionOptions, 'message'> = {};

    if (typeof messageOrOptions === 'object') {
      message = messageOrOptions?.message;
      finalOptions = messageOrOptions;
    } else if (options) {
      message = messageOrOptions;
      finalOptions = options;
    } else {
      message = messageOrOptions;
    }

    if (typeof message !== 'string') {
      message = 'Runtime Exception';
    }

    const {
      messageParams = [],
      safeMessage,
      safeMessageParams = [],
      originalError,
      httpStatus,
    } = finalOptions;

    const formattedMessage = format(message ?? '', ...messageParams);
    const formattedSafeMessage = format(
      safeMessage ?? '',
      ...safeMessageParams,
    );

    super(formattedMessage.length ? formattedMessage : formattedSafeMessage);

    if (httpStatus) {
      this.httpStatus = httpStatus;
    }

    if (formattedSafeMessage.length) {
      this.safeMessage = formattedSafeMessage;
    }

    if (originalError !== undefined) {
      this.context.originalError = mapNonErrorToException(originalError);
    }
  }

  public get errorCode() {
    return this._errorCode;
  }

  protected set errorCode(v: string) {
    this._errorCode = v;
  }
}
