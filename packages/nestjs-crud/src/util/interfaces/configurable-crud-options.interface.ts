import { InjectionToken, PlainLiteralObject, Type } from '@nestjs/common';

import { CrudAdapter } from '../../crud/adapters/crud.adapter';
import { CrudControllerOptionsInterface } from '../../crud/interfaces/crud-controller-options.interface';
import { CrudExtraDecoratorsInterface } from '../../crud/interfaces/crud-extra-decorators.interface';
import {
  CrudCreateManyOptionsInterface,
  CrudCreateOneOptionsInterface,
  CrudDeleteOneOptionsInterface,
  CrudReadAllOptionsInterface,
  CrudReadOneOptionsInterface,
  CrudRecoverOneOptionsInterface,
  CrudReplaceOneOptionsInterface,
  CrudUpdateOneOptionsInterface,
} from '../../crud/interfaces/crud-route-options.interface';
import { CrudService } from '../../services/crud.service';

/**
 * Service config with adapter token - generates a service class that injects the adapter
 */
export interface ConfigurableCrudServiceAdapterOption<
  Entity extends PlainLiteralObject,
> {
  serviceToken: InjectionToken<CrudService<Entity>>;
  adapterToken: InjectionToken<CrudAdapter<Entity>>;
}

/**
 * Service config with useClass - uses the provided service class directly
 */
export interface ConfigurableCrudServiceUseClassOption<
  Entity extends PlainLiteralObject,
> {
  serviceToken: InjectionToken<CrudService<Entity>>;
  useClass: Type<CrudService<Entity>>;
}

export interface ConfigurableCrudOptions<Entity extends PlainLiteralObject> {
  /**
   * Service configuration - either adapter (generate) or useClass (use directly)
   */
  service:
    | ConfigurableCrudServiceAdapterOption<Entity>
    | ConfigurableCrudServiceUseClassOption<Entity>;
  controller: CrudControllerOptionsInterface<Entity> &
    CrudExtraDecoratorsInterface;
  getMany?: CrudReadAllOptionsInterface<Entity> & CrudExtraDecoratorsInterface;
  getOne?: CrudReadOneOptionsInterface<Entity> & CrudExtraDecoratorsInterface;
  createMany?: CrudCreateManyOptionsInterface<Entity> &
    CrudExtraDecoratorsInterface;
  createOne?: CrudCreateOneOptionsInterface<Entity> &
    CrudExtraDecoratorsInterface;
  updateOne?: CrudUpdateOneOptionsInterface<Entity> &
    CrudExtraDecoratorsInterface;
  replaceOne?: CrudReplaceOneOptionsInterface<Entity> &
    CrudExtraDecoratorsInterface;
  deleteOne?: CrudDeleteOneOptionsInterface<Entity> &
    CrudExtraDecoratorsInterface;
  recoverOne?: CrudRecoverOneOptionsInterface<Entity> &
    CrudExtraDecoratorsInterface;
}
