import { ReferenceIdInterface } from '../../reference/interfaces/reference-id.interface';
import { DeepPartial } from '../../utils/deep-partial';

import { CreateOneInterface } from './mutate/create-one.interface';
import { RemoveOneInterface } from './mutate/remove-one.interface';
import { ReplaceOneInterface } from './mutate/replace-one.interface';
import { UpdateOneInterface } from './mutate/update-one.interface';
import { ByIdInterface } from './query/by-id.interface';
import { FindInterface } from './query/find.interface';

export interface ModelServiceInterface<
  Entity extends ReferenceIdInterface,
  Creatable extends DeepPartial<Entity>,
  Updatable extends DeepPartial<Entity> & ReferenceIdInterface<Entity['id']>,
  Replaceable extends Creatable & Pick<Entity, 'id'> = Creatable &
    Pick<Entity, 'id'>,
  Removable extends Pick<Entity, 'id'> = Pick<Entity, 'id'>,
> extends FindInterface<Entity, Entity>,
    ByIdInterface<Entity['id'], Entity>,
    CreateOneInterface<Creatable, Entity>,
    UpdateOneInterface<Updatable, Entity>,
    ReplaceOneInterface<Replaceable, Entity>,
    RemoveOneInterface<Removable, Entity> {}
