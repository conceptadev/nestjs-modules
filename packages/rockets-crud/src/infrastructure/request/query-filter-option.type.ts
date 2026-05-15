import { PlainLiteralObject } from '@nestjs/common';

import { WhereCondition } from '@concepta/rockets-repository';

import { SCondition } from './crud-query.types';

export type QueryFilterOption<T extends PlainLiteralObject> =
  | WhereCondition<T>[]
  | SCondition<T>;
