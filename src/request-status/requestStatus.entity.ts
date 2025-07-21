import { BaseEntity } from "src/baseEntity/base.entity";
import { RequestStatusHistoryEntity } from "src/request-status-history/RequestStatusHistory.entity";
import { RequestEntity } from "src/request/request.entity";
import { Column, Entity, OneToMany } from "typeorm";

/*
*jotsamikel
*Master table that defines all possible statuses a request can have (e.g., pending, accepted, delivered). 
*Allows decoupled and localized status management.
*/
@Entity()
export class RequestStatusEntity extends BaseEntity{
  @Column()
  requestId: number;

  @Column()
  statusId: number;

  @Column()
  changedBy: number;

  @Column()
  changedDate: Date;

  @Column({ nullable: true })
  comment: string;

    @OneToMany(()=>RequestStatusHistoryEntity, (r)=>r.requestStatuses)
    requestStatusHistory: RequestStatusHistoryEntity;
}