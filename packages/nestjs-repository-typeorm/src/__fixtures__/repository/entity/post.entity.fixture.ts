import { Column, Entity, JoinColumn, ManyToMany, ManyToOne } from 'typeorm';

import { CommonSqliteEntity } from '../../../entities/common/common-sqlite.entity';

import { AuthorEntityFixture } from './author.entity.fixture';
import { TagEntityFixture } from './tag.entity.fixture';

@Entity()
export class PostEntityFixture extends CommonSqliteEntity {
  @Column()
  title!: string;

  @ManyToOne(() => AuthorEntityFixture, (author) => author.posts)
  @JoinColumn({ name: 'authorId' })
  author!: AuthorEntityFixture;

  @Column()
  authorId!: string;

  @ManyToMany(() => TagEntityFixture, (tag) => tag.posts)
  tags!: TagEntityFixture[];
}
