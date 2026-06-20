import {
  ByIdInterface,
  FileCreatableInterface,
  ReferenceId,
  CreateOneInterface,
  FileEntityInterface,
} from '@concepta/nestjs-common';

export interface FileModelServiceInterface
  extends
    ByIdInterface<ReferenceId, FileEntityInterface>,
    CreateOneInterface<FileCreatableInterface, FileEntityInterface> {
  getUniqueFile(
    org: Pick<FileCreatableInterface, 'serviceKey' | 'fileName'>,
  ): Promise<FileEntityInterface | null>;
}
