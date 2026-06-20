import {
  ReferenceEmailInterface,
  ReferenceIdInterface,
  ReferenceUsernameInterface,
} from '@concepta/nestjs-core';

/**
 * Credentials Interface
 */
export interface FederatedCredentialsInterface
  extends
    ReferenceIdInterface,
    ReferenceUsernameInterface,
    ReferenceEmailInterface {}
