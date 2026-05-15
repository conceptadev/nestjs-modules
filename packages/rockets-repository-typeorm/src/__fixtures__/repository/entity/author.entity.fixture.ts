import { Column, Entity, OneToMany } from 'typeorm';

import { CommonSqliteEntity } from '../../../entities/common/common-sqlite.entity';

import { PostEntityFixture } from './post.entity.fixture';

@Entity()
export class AuthorEntityFixture extends CommonSqliteEntity {
  @Column()
  name!: string;

  @OneToMany(() => PostEntityFixture, (post) => post.author)
  posts!: PostEntityFixture[];
}
