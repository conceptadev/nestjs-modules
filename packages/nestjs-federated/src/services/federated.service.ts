import { Injectable } from '@nestjs/common';

import {
  NotAnErrorException,
  RepositoryInterface,
  InjectDynamicRepository,
  FederatedEntityInterface,
} from '@concepta/nestjs-common';

import { FederatedQueryException } from '../exceptions/federated-query.exception';
import { FEDERATED_MODULE_FEDERATED_ENTITY_KEY } from '../federated.constants';
import { FederatedServiceInterface } from '../interfaces/federated-service.interface';

@Injectable()
export class FederatedService implements FederatedServiceInterface {
  constructor(
    @InjectDynamicRepository(FEDERATED_MODULE_FEDERATED_ENTITY_KEY)
    protected readonly repo: RepositoryInterface<FederatedEntityInterface>,
  ) {}

  async exists(provider: string, subject: string) {
    try {
      return this.repo.findOne({
        where: {
          provider,
          subject,
        },
      });
    } catch (e) {
      const exception = e instanceof Error ? e : new NotAnErrorException(e);
      throw new FederatedQueryException(this.repo.metadata.name, exception);
    }
  }
}
