import { PlainLiteralObject } from '@nestjs/common';

export interface EntityHeaderInterface extends PlainLiteralObject {
  entity: string;
}
