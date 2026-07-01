import { type AuthenticatedUserInterface } from '../../domain/interfaces/authenticated-user.interface';

export interface AuthUserContextInterface {
  user?: AuthenticatedUserInterface;
}
