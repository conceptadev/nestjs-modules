import {
  ReferenceEmailInterface,
  ReferenceIdInterface,
  ReferenceUsernameInterface,
} from '@concepta/rockets-app';

/**
 * Credentials Interface
 */
export interface FederatedCredentialsInterface
  extends ReferenceIdInterface,
    ReferenceUsernameInterface,
    ReferenceEmailInterface {}
