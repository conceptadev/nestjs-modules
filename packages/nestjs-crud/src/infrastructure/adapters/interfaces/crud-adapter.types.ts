import { PlainLiteralObject, Provider, Type } from '@nestjs/common';

import { CrudAdapter } from '../crud.adapter';

/**
 * Type for providing a CRUD adapter via NestJS DI.
 *
 * Can be:
 * - A class (Type) - the class itself becomes the injection token
 * - A ClassProvider - `{ provide: token, useClass: AdapterClass }`
 * - A FactoryProvider - `{ provide: token, useFactory: () => adapter }`
 * - A ValueProvider - `{ provide: token, useValue: adapterInstance }`
 * - An ExistingProvider - `{ provide: token, useExisting: otherToken }`
 */
export type CrudAdapterProvider<Entity extends PlainLiteralObject> =
  | Type<CrudAdapter<Entity>>
  | Exclude<Provider<CrudAdapter<Entity>>, Type<unknown>>;
