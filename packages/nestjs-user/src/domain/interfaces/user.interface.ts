import {
  ReferenceActiveInterface,
  ReferenceEmailInterface,
  ReferenceUsernameInterface,
} from '@concepta/nestjs-common';

export interface UserInterface
  extends ReferenceEmailInterface,
    ReferenceUsernameInterface,
    ReferenceActiveInterface {}
