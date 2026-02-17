import { PlainLiteralObject } from '@nestjs/common';

import { EntityColumn } from '@concepta/nestjs-common';

import { QueryRelation } from '../../request/crud-query.types';

export interface CrudRelationsInterface<
  Entity extends PlainLiteralObject,
  Relations extends PlainLiteralObject[],
> {
  rootKey: EntityColumn<Entity>;
  relations: {
    [K in keyof Relations]: QueryRelation<Entity, Relations[K]>;
  };
}
