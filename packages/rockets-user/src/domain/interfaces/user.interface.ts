import {
  ReferenceActiveInterface,
  ReferenceEmailInterface,
  ReferenceUsernameInterface,
} from '@concepta/rockets-app';

export interface UserInterface
  extends ReferenceEmailInterface,
    ReferenceUsernameInterface,
    ReferenceActiveInterface {}
