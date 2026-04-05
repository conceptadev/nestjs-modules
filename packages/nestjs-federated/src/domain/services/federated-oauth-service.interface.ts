import { PlainLiteralObject } from '@nestjs/common';

import { FederatedCredentialsInterface } from '../../interfaces/federated-credentials.interface';

export interface FederatedOAuthServiceInterface {
  sign(
    ctx: PlainLiteralObject,
    provider: string,
    email: string,
    subject: string,
  ): Promise<FederatedCredentialsInterface>;
}
