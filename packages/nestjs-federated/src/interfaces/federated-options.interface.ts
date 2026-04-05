import { FederatedUserPortSettings } from '../domain/ports/federated-user.port';
import { FederatedSettingsInterface } from '../infrastructure/config/interfaces/federated-settings.interface';

export interface FederatedOptionsInterface {
  userPort: FederatedUserPortSettings;
  settings?: FederatedSettingsInterface;
}
