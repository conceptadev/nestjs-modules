import {
  ReferenceEmailInterface,
  ReferenceIdInterface,
  ReferenceUsernameInterface,
} from '@concepta/nestjs-common';

import { AuthGithubEmailsInterface } from './auth-github-emails.interface';

export interface AuthGithubProfileInterface
  extends
    ReferenceIdInterface,
    Partial<ReferenceEmailInterface>,
    Partial<ReferenceUsernameInterface> {
  displayName?: string;
  emails?: AuthGithubEmailsInterface[];
}
