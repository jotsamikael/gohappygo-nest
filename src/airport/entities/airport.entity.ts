import { BaseEntity, Column } from "typeorm";

export class AirportEntity extends BaseEntity {

    @Column()
    airportName: string;
  
    @Column()
    city: string;
  
    @Column()
    country: string;
  
    @Column({ nullable: true })
    state?: string;
  
    @Column()
    iataCode: string;
  
    @Column()
    region: string;
  
    @Column({ default: true })
    isActive: boolean;
}
