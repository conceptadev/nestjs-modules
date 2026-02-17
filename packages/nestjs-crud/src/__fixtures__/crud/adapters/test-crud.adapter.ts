import { Injectable, PlainLiteralObject } from '@nestjs/common';

import { RepositoryInterface, WhereClause } from '@concepta/nestjs-common';

import { CrudAdapter } from '../../../crud/adapters/crud.adapter';
import { CrudContextOptionsInterface } from '../../../crud/interfaces/crud-context-options.interface';
import { CrudContextInterface } from '../../../crud/interfaces/crud-context.interface';
import { CrudParsedQueryInterface } from '../../../request/interfaces/crud-parsed-query.interface';

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
}
