import { PlainLiteralObject } from '@nestjs/common';

import { CrudLocal } from './crud-local.interface';

export interface WithLocalContextInterface {
  withLocal<T extends PlainLiteralObject>(
    localClass: CrudLocal<T>,
  ): Readonly<T> | undefined;
}
