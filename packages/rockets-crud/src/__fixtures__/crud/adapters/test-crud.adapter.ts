import { Injectable, PlainLiteralObject } from '@nestjs/common';

import { RepositoryInterface, WhereClause } from '@concepta/rockets-repository';

import { CrudAdapter } from '../../../infrastructure/adapters/crud.adapter';
import { CrudContextOptionsInterface } from '../../../infrastructure/interceptors/interfaces/crud-context-options.interface';
import { CrudContextInterface } from '../../../infrastructure/interceptors/interfaces/crud-context.interface';
import { CrudParsedQueryInterface } from '../../../infrastructure/request/interfaces/crud-parsed-query.interface';

@Injectable()
export class TestCrudAdapter<
  T extends PlainLiteralObject,
> extends CrudAdapter<T> {
  constructor(repository: RepositoryInterface<T>) {
    super(repository);
  }

  decidePagination(
    _query: CrudParsedQueryInterface<T>,
    _options: CrudContextOptionsInterface<T>,
  ): boolean {
    return true;
  }

  exposedBuildWhere(context: CrudContextInterface<T>): WhereClause | undefined {
    return this.buildWhere(context);
  }

  exposedValidateWhereFields(clause: WhereClause | undefined): void {
    return this.validateWhereFields(clause);
  }
}
