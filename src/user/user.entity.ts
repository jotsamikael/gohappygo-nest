import { BaseEntity } from 'src/baseEntity/base.entity';
import { DemandEntity } from 'src/demand/demand.entity';
import { MessageEntity } from 'src/message/message.entity';
import { RequestEntity } from 'src/request/request.entity';
import { UserRoleEntity } from 'src/role/userRole.entity';
import { TravelEntity } from 'src/travel/travel.entity';
import { UploadedFileEntity } from 'src/uploaded-file/uploaded-file.entity';
import { UserActivationEntity } from 'src/user-activation/user-activation.entity';
import { UserVerificationAuditEntity } from 'src/user-verification-audit-entity/user-verification-audit.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
} from 'typeorm';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  OPERATOR = 'OPERATOR',
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
  firstName: string;

  @Column()
  lastName: string;

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

  @Column({ default: false })
  isPhoneVerified: boolean;

  @Column({ default: false })
  isVerified: boolean; // Full verification after selfie + ID

   @OneToMany(() => MessageEntity, (messages) => messages.sender)
   messagesSend: MessageEntity[];

   @OneToMany(() => MessageEntity, (messages) => messages.receiver)
   messagesReceived: MessageEntity[];


  @OneToMany(() => UserActivationEntity, (activation) => activation.user)
  activations: UserActivationEntity[];

  @OneToMany(() => UploadedFileEntity, (file) => file.user)
  files: UploadedFileEntity[];

  // All logs related to the user being verified
  @OneToMany(() => UserVerificationAuditEntity, (log) => log.reviewedUser)
  verificationLogs: UserVerificationAuditEntity[];

  // If this user is an admin, actions they’ve taken
  @OneToMany(() => UserVerificationAuditEntity, (log) => log.verifiedBy)
  verificationActions: UserVerificationAuditEntity[];

   @OneToMany(() => RequestEntity, (request) => request.requester)
  requests: RequestEntity[];


}
