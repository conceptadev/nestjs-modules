import { PlainLiteralObject, Type } from '@nestjs/common';

import { ActionEnum, Operation, ReadOperation } from '@concepta/rockets-app';
import {
  isArrayCondition,
  WhereCondition,
  WhereConditionArray,
} from '@concepta/rockets-repository';

import { CrudAdapter } from '../adapters/crud.adapter';
import { CrudAdapterProvider } from '../adapters/interfaces/crud-adapter.types';
import { CrudDecoratorException } from '../exceptions/crud-decorator.exception';
import { CrudControllerEntityInterface } from '../interfaces/crud-controller-entity.interface';

/**
 * Gets the dynamic adapter token for a given name.
 *
 * @param name - The entity name
 * @returns A unique string token for the adapter
 */
export function getDynamicAdapterToken(name: string): string {
  return `CRUD_ADAPTER_${name.toUpperCase()}`;
}

/**
 * Type guard to check if a value is a Type (class constructor)
 */
export function isAdapterType<T extends PlainLiteralObject>(
  value: CrudAdapterProvider<T>,
): value is Type<CrudAdapter<T>> {
  return typeof value === 'function';
}

/**
 * Get the effective controller name for CQRS class naming and operationIds.
 *
 * @param options - Controller naming options
 * @returns The name if provided, otherwise the entity key
 */
export function getControllerName(
  options: CrudControllerEntityInterface,
): string {
  return options.name ?? options.entity;
}

export function getMethodHandler(
  target: object,
  propertyKey: string | symbol,
): CallableFunction {
  const handler = Reflect.get(target, propertyKey);
  if (typeof handler !== 'function') {
    throw new CrudDecoratorException({
      message: `Property ${String(propertyKey)} is not a method`,
    });
  }
  return handler;
}

export function safeRequire<T = unknown>(
  path: string,
  loader?: () => T,
): T | null {
  try {
    /* istanbul ignore next */
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pack = loader ? loader() : require(path);
    return pack;
  } catch (_) {
    /* istanbul ignore next */
    return null;
  }
}

/**
 * Check if a class has an explicit constructor defined.
 * Uses design:paramtypes metadata which is only set when a constructor exists.
 *
 * Accepts Function to work with ClassDecorator targets.
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function hasExplicitConstructor(targetClass: Function): boolean {
  return Reflect.getMetadata('design:paramtypes', targetClass) !== undefined;
}

export function queryFilterIsArray(
  cond: WhereCondition,
): cond is WhereConditionArray {
  return isArrayCondition(cond) && cond.value.length > 0;
}

/**
 * Maps a CRUD operation to its corresponding action category.
 *
 * @param operation - The CRUD operation (List, Read, Create, etc.)
 * @returns The action category (CREATE, READ, UPDATE, DELETE)
 */
export function operationToAction(operation: Operation): ActionEnum {
  switch (operation) {
    case Operation.Create:
    case Operation.CreateBatch:
      return ActionEnum.CREATE;
    case Operation.List:
    case Operation.Read:
      return ActionEnum.READ;
    case Operation.Update:
    case Operation.Replace:
    case Operation.Restore:
      return ActionEnum.UPDATE;
    case Operation.Delete:
    case Operation.SoftDelete:
      return ActionEnum.DELETE;
  }
}

/**
 * Type guard to check if an operation is a read operation.
 */
export function isReadOperation(
  operation: unknown,
): operation is ReadOperation {
  return operation === Operation.List || operation === Operation.Read;
}

/**
 * Type guard to check if an operation requires a body parameter.
 */
export function isBodyOperation(operation: Operation): boolean {
  return [
    Operation.Create,
    Operation.CreateBatch,
    Operation.Update,
    Operation.Replace,
  ].includes(operation);
}
