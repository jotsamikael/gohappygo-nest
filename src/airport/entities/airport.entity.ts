import { BaseEntity } from "src/baseEntity/base.entity";
import { Column, Entity } from "typeorm";

@Entity()
export class AirportEntity extends BaseEntity {

    @Column()
    airportName: string;
  
    @Column()
    city: string;
  
    @Column()
    country: string;
  
    @Column({ nullable: true })
    state?: string;
  
    @Column({nullable: true})
    iataCode: string;
  
    @Column()
    region: string;
  
    @Column({ default: true })
    isActive: boolean;
}
