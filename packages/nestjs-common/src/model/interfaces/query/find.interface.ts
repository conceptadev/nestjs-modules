import { ReferenceIdInterface } from '../../../reference/interfaces/reference-id.interface';
import { RepositoryFindOptions } from '../../../repository/interfaces/repository-options.interface';

export interface FindInterface<
  T extends ReferenceIdInterface = ReferenceIdInterface,
  U extends T = T,
> {
  find(options?: RepositoryFindOptions<T>): Promise<U[]>;
}
