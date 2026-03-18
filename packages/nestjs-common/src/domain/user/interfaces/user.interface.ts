import { ReferenceActiveInterface } from '../../../reference/interfaces/reference-active.interface';
import { ReferenceEmailInterface } from '../../../reference/interfaces/reference-email.interface';
import { ReferenceUsernameInterface } from '../../../reference/interfaces/reference-username.interface';

export interface UserInterface
  extends ReferenceEmailInterface,
    ReferenceUsernameInterface,
    ReferenceActiveInterface {}
