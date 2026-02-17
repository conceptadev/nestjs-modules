import { PlainLiteralObject } from '@nestjs/common';

import { WhereCondition } from '@concepta/nestjs-common';

import { SCondition } from '../../request/crud-query.types';

export type QueryFilterOption<T extends PlainLiteralObject> =
  | WhereCondition<T>[]
  | SCondition<T>;
