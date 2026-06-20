import { PlainLiteralObject } from '@nestjs/common';

import { AppContextInterface } from './interfaces/app-context.interface';

export type AppContextLike =
  | AppContextInterface
  | PlainLiteralObject
  | null
  | undefined;
