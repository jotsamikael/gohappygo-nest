import { AirportEntity } from "src/airport/entities/airport.entity";
import { BaseEntity } from "src/baseEntity/base.entity";
import { RequestEntity } from "src/request/request.entity";
import { UserEntity } from "src/user/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";
/*
*jotsamikael
*Represents a delivery request posted by a sender (HappyExpéditeur) with origin, destination, weight, and desired delivery date. 
*/
@Entity()
export class DemandEntity extends BaseEntity{

  @Column()
  userId: number;

  @Column()
  title: string;

  @Column()
  description: string;

  
  @Column({nullable:true})
  flightNumber: string;

 // Add the foreign key columns
 @Column()
 originAirportId: number;

 @Column()
 destinationAirportId: number;

  @Column()
  deliveryDate: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  weight: number;

  @Column('decimal', { precision: 10, scale: 2 })
  pricePerKg: number;

  @Column({ type: 'enum', enum: ['active', 'expired', 'cancelled','resolved'] })
  status: string;

 @ManyToOne(() => AirportEntity, { nullable: false })
 @JoinColumn({ name: 'originAirportId' })
 originAirport: AirportEntity;

 @ManyToOne(() => AirportEntity, { nullable: false })
 @JoinColumn({ name: 'destinationAirportId' })
 destinationAirport: AirportEntity;

  @ManyToOne(()=> UserEntity, (u)=> u.demands)
    user: UserEntity

  @OneToMany(()=> RequestEntity, (r)=>r.demand)
    requests: RequestEntity[]
}