import {
  ReferenceEmailInterface,
  ReferenceIdInterface,
} from '@concepta/nestjs-common';

import { AuthGoogleEmailsInterface } from './auth-google-emails.interface';

export interface AuthGoogleProfileInterface
  extends ReferenceIdInterface, Partial<ReferenceEmailInterface> {
  displayName: string;
  name: {
    familyName: string;
    givenName: string;
    middleName?: string;
  };
  emails?: AuthGoogleEmailsInterface[];
  _raw: string;
  _json: Record<string, unknown>;
}
