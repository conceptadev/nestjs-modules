import { ReferenceIdInterface } from '@concepta/rockets-app';

export interface PhotoEntityInterfaceFixture extends ReferenceIdInterface {
  name: string;
  description: string;
  filename: string;
  views: number;
  isPublished: boolean;
  deletedAt: Date | null;
}
