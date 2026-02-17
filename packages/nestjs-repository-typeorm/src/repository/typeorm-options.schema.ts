import {
  FindManyOptions,
  FindOneOptions,
  FindOptionsWhere,
  EntityTarget,
} from 'typeorm';
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';
import { z } from 'zod';

import { Type, PlainLiteralObject } from '@nestjs/common';

import { RepositoryColumnMetadataInterface } from '@concepta/nestjs-common';

/**
 * Schema for FindOptionsWhere validation.
 */
const FindWhereSchema = z.union([
  z.record(z.any()),
  z.array(z.record(z.any())),
]);

/**
 * Schema for FindOneOptions validation.
 */
const FindOneSchema = z
  .object({
    select: z.array(z.string()).optional(),
    where: FindWhereSchema.optional(),
    order: z.record(z.any()).optional(),
    withDeleted: z.boolean().optional(),
  })
  .passthrough() satisfies z.ZodType<FindOneOptions>;

/**
 * Schema for FindManyOptions validation.
 */
const FindManySchema = FindOneSchema.extend({
  skip: z.number().optional(),
  take: z.number().optional(),
  relations: z.union([z.array(z.string()), z.record(z.any())]).optional(),
}).passthrough() satisfies z.ZodType<FindManyOptions>;

/**
 * Type guard for FindOptionsWhere.
 */
export function isFindOptionsWhere<Entity extends PlainLiteralObject>(
  input: unknown,
): input is FindOptionsWhere<Entity> {
  return FindWhereSchema.safeParse(input).success;
}

/**
 * Type guard for TypeORM FindOneOptions.
 */
export function isFindOneOptions<Entity>(
  input: unknown,
): input is FindOneOptions<Entity> {
  return FindOneSchema.safeParse(input).success;
}

/**
 * Type guard for TypeORM FindManyOptions.
 */
export function isFindManyOptions<Entity>(
  input: unknown,
): input is FindManyOptions<Entity> {
  return FindManySchema.safeParse(input).success;
}

/**
 * Type guard that validates EntityTarget satisfies Type<Entity>.
 */
export function isEntity<Entity extends PlainLiteralObject>(
  target: EntityTarget<Entity>,
): target is Type<Entity> {
  return typeof target === 'function' && target.prototype !== undefined;
}

/**
 * Build Entity from EntityTarget, throwing if invalid.
 */
export function buildEntity<Entity extends PlainLiteralObject>(
  target: EntityTarget<Entity>,
  entityName: string,
): Type<Entity> {
  if (!isEntity(target)) {
    throw new Error(`Invalid entity for "${entityName}"`);
  }
  return target;
}

/**
 * Map TypeORM column metadata to typed repository column metadata.
 */
export function buildColumns<Entity extends PlainLiteralObject>(
  columns: ColumnMetadata[],
): RepositoryColumnMetadataInterface<Entity>[] {
  return columns.map((col) => {
    return {
      name: col.propertyName,
      isPrimary: col.isPrimary,
      isRemoveDate: col.isDeleteDate,
    };
  });
}
