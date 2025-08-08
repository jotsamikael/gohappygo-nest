import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RequestStatusEntity } from './requestStatus.entity';
import { Repository } from 'typeorm';

@Injectable()
export class RequestStatusService implements OnModuleInit {
   
 
constructor(@InjectRepository(RequestStatusEntity) private requestStatusRepository: Repository<RequestStatusEntity>){

}

     async onModuleInit() {
    await this.seedRquestStatus();
  }


  async getRequestByStatus(status: string): Promise<RequestStatusEntity| null>{
   const requestStatus = await this.requestStatusRepository.findOneBy({status:status});
   if(!requestStatus){
    throw new NotFoundException(`No request status record found for ${status}`);
   }
   return requestStatus;
  }

    async seedRquestStatus() {
        const defaultRequestatus = [
      {
        label: 'Accepted',
        status: 'ACCEPTED',
        comment: 'Annoncer has accepted user\'s offer',
      },
         {
        label: 'Negotiating',
        status: 'NEGOTIATING',
        comment: 'User has inquired about the demand or travel and both parties are negotiating',
      },
         {
        label: 'Delivered',
        status: 'DELIVERED',
        comment: 'Parcel has been delivered',
      },
    ];

    for (const requestStatus of defaultRequestatus) {
      const existing = await this.requestStatusRepository.findOneBy({
        status: requestStatus.status,
      });
      if (!existing) {
        await this.requestStatusRepository.save(requestStatus);
        console.log(`🟢 requestStatus '${requestStatus.status}' created`);
      } else {
        console.log(`🟡 requestStatus '${requestStatus.status}' already exists`);
      }
    }
    }

    getRequestStatuses() {
      return this.requestStatusRepository.find();
  }
}
