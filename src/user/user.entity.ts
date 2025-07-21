import { BaseEntity } from 'src/baseEntity/base.entity';
import { DemandEntity } from 'src/demand/demand.entity';
import { UserRoleEntity } from 'src/role/userRole.entity';
import { TravelEntity } from 'src/travel/travel.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';


export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

/*
*jotsamikael
*Represents a platform user (either sender or traveler). 
*Stores identity, contact info, and role, and is linked to all activity such as announcements, travels, reviews, and transactions.
*/
@Entity()
export class UserEntity extends BaseEntity {
  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  phone: string;

  @Column()
  name: string;

  @Column()
  username: string;

  @Column({ nullable: true })
  profilePictureUrl: string;

  @Column()
  password: string; //hash password

  @Column()
  roleId: number;

  @ManyToOne(() => UserRoleEntity, (userRoleEntity) => userRoleEntity.users)
  role: UserRoleEntity;

  @OneToMany(() => DemandEntity, (d) => d.user)
  demands: DemandEntity[];

  @OneToMany(() => TravelEntity, (t) => t.user)
  travels: TravelEntity[];
}
