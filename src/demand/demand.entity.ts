import { BaseEntity } from "src/baseEntity/base.entity";
import { RequestEntity } from "src/request/request.entity";
import { UserEntity } from "src/user/user.entity";
import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
/*
*jotsamikael
*Represents a delivery request posted by a sender (HappyExpéditeur) with origin, destination, weight, and desired delivery date. 
*Used in the ClassicGo service.
*/
@Entity()
export class DemandEntity extends BaseEntity{

  @Column()
  userId: number;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  origin: string;

  @Column()
  destination: string;

  @Column()
  deliveryDate: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  weight: number;

  @Column('decimal', { precision: 10, scale: 2 })
  pricePerKg: number;

  @Column({ type: 'enum', enum: ['active', 'expired', 'cancelled'] })
  status: string;

    @ManyToOne(()=> UserEntity, (u)=> u.demands)
    user: UserEntity

    @OneToMany(()=> RequestEntity, (r)=>r.demand)
    requests: RequestEntity[]
}