import {
  Entity,
  Column,
  DeleteDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import { BaseEntity } from '../base-entity';
import { CompanyEntity } from '../company/company.entity';
import { UserProfileEntity } from '../user-profile/user-profile.entity';

@Entity('users')
export class UserEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  email!: string;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'varchar', nullable: true })
  firstName!: string | null;

  @Column({ type: 'varchar', nullable: true })
  lastName!: string | null;

  @Column({ nullable: false })
  companyId?: number;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;

  userProfile?: UserProfileEntity;

  @ManyToOne(() => CompanyEntity, (company) => company.users, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'companyId' })
  company?: CompanyEntity;
}
