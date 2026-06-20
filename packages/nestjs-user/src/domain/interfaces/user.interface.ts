import {
  ReferenceActiveInterface,
  ReferenceEmailInterface,
  ReferenceUsernameInterface,
} from '@concepta/nestjs-core';

export interface UserInterface
  extends
    ReferenceEmailInterface,
    ReferenceUsernameInterface,
    ReferenceActiveInterface {}
