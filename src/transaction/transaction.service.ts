import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Transaction } from 'typeorm';
import { TransactionEntity } from './transaction.entity';
import { RequestService } from 'src/request/request.service';
import { UserService } from 'src/user/user.service';
import { RequestEntity } from 'src/request/request.entity';

@Injectable()
export class TransactionService {

    constructor(
        @InjectRepository(TransactionEntity)
        private transactionRepository: Repository<TransactionEntity>,
        private userService: UserService,
        private requestService: RequestService
    ) {}

    //Automatically create transaction from request, when request is accepted
    //At this point payment is done and funds are deducted from payer but are still hold by stripe
     async createTransactionFromRequest(request: RequestEntity): Promise<void> {
        const transaction = this.transactionRepository.create({
          requestId: request.id,
          payerId: request.requesterId, // The person who made the request pays
          payeeId: request.travelId ? request.travel.user.id : request.demand.user.id, // Travel creator or demand creator receives payment
          amount: request.offerPrice,
          status: 'pending', // Payment needs to be processed
          paymentMethod: 'platform' // or whatever default method
        });
      
        await this.transactionRepository.save(transaction);
      }



    async getTransactionById(id: number): Promise<TransactionEntity> {
        const transaction = await this.transactionRepository.findOne({ where: { id } });
        if (!transaction) {
            throw new NotFoundException('Transaction not found');
        }
        return transaction;
    }

    //get all transactions where user is payer or payee
   async getTransactionsByUserId(userId: number): Promise<TransactionEntity[]> {
    return this.transactionRepository.find({
        where: [
          { payerId: userId },
          { payeeId: userId }
        ]
      });
   }

   //After service is performed, funds are released from stripe to payee
   //This is triggered when payer marks request as completed
   async releaseFundsFromStripe(transactionId: number): Promise<void> {
    const transaction = await this.getTransactionById(transactionId);
    if (!transaction) {
        throw new NotFoundException('Transaction not found');
    }
   }
    
}
