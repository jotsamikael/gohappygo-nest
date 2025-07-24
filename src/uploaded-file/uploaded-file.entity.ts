import { UserEntity } from "src/user/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { FilePurpose } from "./uploaded-file-purpose.enum";

@Entity()
export class UploadedFileEntity{
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  originalName: string;

  @Column()
  fileUrl: string;

  @Column()
  size: number

  @Column()
  publicId: string;

  @Column()
  mimeType: string;

  @Column()
  purpose: FilePurpose // or enum

  @CreateDateColumn()
  uploadedAt: Date;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  user: UserEntity;
}