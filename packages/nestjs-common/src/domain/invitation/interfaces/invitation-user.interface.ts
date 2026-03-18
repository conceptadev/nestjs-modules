import { UserInterface } from '../../user/interfaces/user.interface';

export interface InvitationUserInterface extends Pick<UserInterface, 'email'> {}
