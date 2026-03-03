import { PlainLiteralObject } from '@nestjs/common';

import { CrudFederationService } from '../../../infrastructure/services/crud-federation.service';

export function createMockFederationService<
  Entity extends PlainLiteralObject = PlainLiteralObject,
>() {
  return {
    list: jest.fn(),
    read: jest.fn(),
  } as unknown as CrudFederationService<Entity, PlainLiteralObject[]> & {
    list: jest.Mock;
    read: jest.Mock;
  };
}
