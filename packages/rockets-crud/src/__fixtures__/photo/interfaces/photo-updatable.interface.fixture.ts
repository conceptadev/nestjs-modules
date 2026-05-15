import { PhotoEntityInterfaceFixture } from './photo-entity.interface.fixture';

export interface PhotoUpdatableInterfaceFixture
  extends Pick<
    PhotoEntityInterfaceFixture,
    'name' | 'description' | 'filename' | 'isPublished' | 'views'
  > {}
