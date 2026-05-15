import { Exclude } from 'class-transformer';

import { PickType } from '@nestjs/swagger';

import { PhotoCreatableInterfaceFixture } from '../interfaces/photo-creatable.interface.fixture';

import { PhotoDtoFixture } from './photo.dto.fixture';

@Exclude()
export class PhotoCreateDtoFixture
  extends PickType(PhotoDtoFixture, [
    'name',
    'description',
    'filename',
    'isPublished',
  ] as const)
  implements PhotoCreatableInterfaceFixture {}
