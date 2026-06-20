import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { isObject } from '@nestjs/common/utils/shared.utils';
import { HttpAdapterHost } from '@nestjs/core';

import { ExceptionInterface } from '../../../domain/exceptions/interfaces/exception.interface';
import { RuntimeException } from '../../../domain/exceptions/runtime.exception';
import {
  ERROR_CODE_UNKNOWN,
  ERROR_MESSAGE_FALLBACK,
} from '../../../infrastructure/constants/error-codes.constants';
import { mapHttpStatus } from '../../../infrastructure/utils/map-http-status.util';

@Catch()
export class ExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: ExceptionInterface, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    let errorCode = ERROR_CODE_UNKNOWN;
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: unknown = ERROR_MESSAGE_FALLBACK;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      errorCode = mapHttpStatus(statusCode);
      const res = exception.getResponse();
      if (isObject(res) && 'message' in res) {
        message = res.message;
      } else {
        message = res;
      }
    } else if (exception instanceof RuntimeException) {
      errorCode = exception.errorCode;
      if (exception.httpStatus) {
        statusCode = exception.httpStatus;
      }
      if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        message = exception.safeMessage ?? ERROR_MESSAGE_FALLBACK;
      } else if (exception.safeMessage) {
        message = exception.safeMessage;
      } else {
        message =
          exception.message ?? exception.safeMessage ?? ERROR_MESSAGE_FALLBACK;
      }
    }

    const responseBody = {
      statusCode,
      errorCode,
      message,
      timestamp: new Date().toISOString(),
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, statusCode);
  }
}
