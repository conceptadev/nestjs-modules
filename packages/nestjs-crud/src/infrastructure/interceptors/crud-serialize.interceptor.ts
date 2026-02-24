import {
  instanceToPlain,
  plainToInstance,
  ClassTransformOptions,
} from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  CallHandler,
  ExecutionContext,
  Inject,
  NestInterceptor,
  PlainLiteralObject,
  StreamableFile,
  Type,
} from '@nestjs/common';
import { isFunction, isObject } from '@nestjs/common/utils/shared.utils';

import { CRUD_MODULE_SETTINGS_TOKEN } from '../../crud.constants';
import { CrudModuleSettingsInterface } from '../config/interfaces/crud-module-settings.interface';
import { CrudInvalidResponseDto } from '../dtos/crud-invalid-response.dto';
import { CrudResponsePaginatedDto } from '../dtos/crud-response-paginated.dto';
import { CrudResponsePaginatedInterface } from '../dtos/interfaces/crud-response-paginated.interface';
import { CrudException } from '../exceptions/crud.exception';
import { CrudSerializationOptionsInterface } from '../interfaces/crud-serialization-options.interface';
import { CrudMetaview } from '../services/crud-metaview.service';
import { crudIsPaginatedHelper } from '../utils/crud-is-paginated.helper';

type ResponseType =
  | (PlainLiteralObject & CrudResponsePaginatedInterface)
  | Array<PlainLiteralObject>;

export class CrudSerializeInterceptor<
  T extends PlainLiteralObject = PlainLiteralObject,
> implements NestInterceptor
{
  constructor(
    @Inject(CRUD_MODULE_SETTINGS_TOKEN)
    private settings: CrudModuleSettingsInterface,
    private reflectionService: CrudMetaview<T>,
  ) {}

  /**
   * @internal
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    // get the options
    const options = this.getOptions(context);

    // serialize the response
    return next
      .handle()
      .pipe(map((response: ResponseType) => this.serialize(response, options)));
  }

  /**
   * @internal
   */
  protected serialize(
    response: ResponseType,
    options: CrudSerializationOptionsInterface,
  ) {
    // reasons to bail
    if (!isObject(response) || response instanceof StreamableFile) {
      // return response untouched
      return response;
    }

    // determine the type to use
    const type =
      !Array.isArray(response) && crudIsPaginatedHelper(response) === true
        ? options?.paginatedType
        : options?.type;

    // must have a dto type
    if (type !== undefined && isFunction(type)) {
      // convert each object to DTO type, then convert back to plain object
      return this.toPlain(
        this.toInstance(type, response, options?.toInstanceOptions),
        options?.toPlainOptions,
      );
    } else {
      // this should never happen, but needed just in
      // case somebody removes the defaults
      throw new CrudException({
        message: 'Impossible to serialize data without a DTO type.',
      });
    }
  }

  protected toInstance(
    type: Type,
    targetObject: ResponseType,
    options?: ClassTransformOptions,
  ): Type {
    return plainToInstance(type, targetObject, options);
  }

  protected toPlain(
    instance: Type,
    options?: ClassTransformOptions,
  ): Record<string, unknown> {
    return instanceToPlain(instance, options);
  }

  protected getOptions(
    context: ExecutionContext,
  ): CrudSerializationOptionsInterface {
    const target = context.getClass();
    const handler = context.getHandler();

    // get serialization options
    const options =
      this.reflectionService.getAllSerializationOptions(target, handler) ?? {};

    // is the type missing?
    if (!options?.type) {
      // yes, set it from response resource
      options.type =
        this.reflectionService.getResponseResource(target, handler) ??
        CrudInvalidResponseDto;
    }

    // is the paginated type missing?
    if (!options?.paginatedType) {
      // yes, set it from response paginated
      options.paginatedType =
        this.reflectionService.getResponsePaginated(target, handler) ??
        CrudResponsePaginatedDto;
    }

    return {
      ...options,
      toInstanceOptions: {
        ...(this.settings?.serialization?.toInstanceOptions ?? {}),
        ...(options.toInstanceOptions ?? {}),
      },
      toPlainOptions: {
        ...(this.settings?.serialization?.toPlainOptions ?? {}),
        ...(options.toPlainOptions ?? {}),
      },
    };
  }
}
