import { BaseEntity } from "src/baseEntity/base.entity";
import { DeliveyProofEntity } from "src/delivery-proof/delivery-proof.entity";
import { DemandEntity } from "src/demand/demand.entity";
import { InsuranceEntity } from "src/insurance/insurance.entity";
import { LegalProtectionEntity } from "src/legal-protection/legal-protection.entity";
import { MessageEntity } from "src/message/message.entity";
import { RequestStatusHistoryEntity } from "src/request-status-history/RequestStatusHistory.entity";
import { TransactionEntity } from "src/transaction/transaction.entity";
import { TravelEntity } from "src/travel/travel.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne } from "typeorm";

/*
*jotsamikael
*Represents a match between a sender and a traveler. 
*This is the core transaction unit that binds an announcement and a travel. It includes proposed price, package info, and triggers insurance and legal protection services.
*/

@Entity()
export class RequestEntity extends BaseEntity{

@Column()
  demandId: number;

  @Column()
  travelId: number;

  @Column({ type: 'enum', enum: ['GoAndGive', 'GoAndGo'] })
  requestType: 'GoAndGive' | 'GoAndGo';

  @Column('decimal', { precision: 10, scale: 2 })
  offerPrice: number;

  @Column('text')
  packageDescription: string;

  @Column('decimal', { precision: 10, scale: 2 })
  weight: number;


    @OneToMany(()=>RequestStatusHistoryEntity, (r)=>r.requestStatuses)
    requestStatusHistory: RequestStatusHistoryEntity;


   @OneToOne(()=> InsuranceEntity, (r)=>r.request)
    insurance: InsuranceEntity;

    @OneToOne(()=> LegalProtectionEntity, (l)=>l.request)
    legalProtections: LegalProtectionEntity;

    @OneToOne(()=> DeliveyProofEntity, (d)=>d.request)
    deliveryProof: DeliveyProofEntity;

    @OneToMany(()=> TransactionEntity, (t)=>t.request)
    transactions: TransactionEntity[];

    @OneToMany(()=> MessageEntity, (m)=>m.request)
    messages: MessageEntity[];

    @ManyToOne(()=>DemandEntity, (d)=>d.requests)
    @JoinColumn({name:'demandId'})
    demand: DemandEntity

    @ManyToOne(()=>TravelEntity, (d)=>d.requests)
    @JoinColumn({name:'travelId'})
    travel: TravelEntity
}