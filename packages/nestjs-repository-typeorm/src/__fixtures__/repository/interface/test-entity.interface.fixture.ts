import { AuditInterface, ReferenceIdInterface } from '@concepta/nestjs-common';

export interface TestInterfaceFixture
  extends ReferenceIdInterface,
    AuditInterface {
  firstName: string;
  lastName?: string;
}
