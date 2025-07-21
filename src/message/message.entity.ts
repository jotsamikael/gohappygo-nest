import { BaseEntity } from "src/baseEntity/base.entity";
import { RequestEntity } from "src/request/request.entity";
import { Entity, ManyToOne } from "typeorm";


/*jotsamikael
*Represents chat messages exchanged between sender and traveler about a specific request.
*Helps ensure communication happens within the platform.
*/
@Entity()
export class MessageEntity extends BaseEntity{


    @ManyToOne(()=>RequestEntity, (r)=>r.messages)
    request: RequestEntity;
}