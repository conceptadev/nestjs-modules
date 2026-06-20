import { FileCreatableInterface } from './file-creatable.interface';
import { FileInterface } from './file.interface';

export interface FileUpdatableInterface
  extends Pick<FileInterface, 'id'>, FileCreatableInterface {}
