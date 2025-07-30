import { AirportEntity } from "src/airport/entities/airport.entity";
import { BaseEntity } from "src/baseEntity/base.entity";
import { RequestEntity } from "src/request/request.entity";
import { UserEntity } from "src/user/user.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";

/* @jotsamikael
*Represents a travel declaration posted by a traveler (HappyVoyageur), including flight and baggage availability details. Used in the GoAndGo service.
*
*/

@Entity()
export class TravelEntity extends BaseEntity {
  @Column()
  userId: number;

  @Column()
  title: string;

  @Column()
  flightNumber: string;

  @Column()
  airline: string;

  @Column()
  departureAirportId: number;

  @Column()
  arrivalAirportId: number;

  @ManyToOne(() => AirportEntity, { nullable: false })
  @JoinColumn({ name: 'departureAirportId' })
  departureAirport: AirportEntity;

  @ManyToOne(() => AirportEntity, { nullable: false })
  @JoinColumn({ name: 'arrivalAirportId' })
  arrivalAirport: AirportEntity;

  @Column()
  departureDatetime: Date;

  @Column()
  arrivalDatetime: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  totalWeightAllowance: number;

  @Column('decimal', { precision: 10, scale: 2 })
  weightAvailable: number;

  @Column({ type: 'enum', enum: ['active', 'filled', 'cancelled'] })
  status: string;

  @ManyToOne(() => UserEntity, (u) => u.travels)
  user: UserEntity;

  @OneToMany(() => RequestEntity, (r) => r.demand)
  requests: RequestEntity[]
}