import { ActionEnum } from '@concepta/nestjs-common';

export interface AccessControlGrantOptionInterface {
  resource: string;
  action: ActionEnum;
}
