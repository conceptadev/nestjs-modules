import {
  ReferenceEmailInterface,
  ReferenceIdInterface,
} from '@concepta/nestjs-common';

export interface AuthGithubCredentialsInterface
  extends ReferenceIdInterface, ReferenceEmailInterface {}
