import { PhotoEntityInterfaceFixture } from './photo-entity.interface.fixture';

export interface PhotoCreatableInterfaceFixture
  extends Pick<
    PhotoEntityInterfaceFixture,
    'name' | 'description' | 'filename' | 'isPublished'
  > {}
