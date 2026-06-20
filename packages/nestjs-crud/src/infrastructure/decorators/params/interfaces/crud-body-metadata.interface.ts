import { CrudBodyOptionsInterface } from './crud-body-options.interface';

export interface CrudBodyMetadataInterface {
  parameterIndex: number;
  validation: CrudBodyOptionsInterface['validation'];
  pipes: CrudBodyOptionsInterface['pipes'];
}
