import { PlainLiteralObject } from '@nestjs/common';

export interface CacheEventHeaderInterface extends PlainLiteralObject {
  namespace: string;
}
