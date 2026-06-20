import {
  ReferenceEmailInterface,
  ReferenceIdInterface,
} from '@concepta/nestjs-common';

export interface AuthGoogleCredentialsInterface
  extends ReferenceIdInterface, ReferenceEmailInterface {}
