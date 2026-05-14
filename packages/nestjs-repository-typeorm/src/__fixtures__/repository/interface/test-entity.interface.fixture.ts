import { AuditInterface, ReferenceIdInterface } from '@concepta/rockets-app';

export interface TestInterfaceFixture
  extends ReferenceIdInterface,
    AuditInterface {
  firstName: string;
  lastName?: string;
}
