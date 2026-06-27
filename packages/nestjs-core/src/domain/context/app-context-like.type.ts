import { type PlainLiteralObject } from '@nestjs/common';

import { type AppContextInterface } from './interfaces/app-context.interface';

export type AppContextLike =
  | AppContextInterface
  | PlainLiteralObject
  | null
  | undefined;
