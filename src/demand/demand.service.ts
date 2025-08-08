import { BadRequestException, Inject, Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { DemandEntity } from './demand.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/user/user.entity';
import { CreateDemandDto } from './dto/createDemand.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { FindDemandsQueryDto } from './dto/FindDemandsQuery.dto';
import { PaginatedResponse } from 'src/common/interfaces/paginated-reponse.interfaces';
import { UserRoleEntity } from 'src/role/userRole.entity';

@Injectable()
export class DemandService {

      private demandListCacheKeys: Set<string> = new Set();

    constructor(@InjectRepository(DemandEntity) private demandRepository: Repository<DemandEntity>,
     @Inject(CACHE_MANAGER) private cacheManager: Cache
){}

 private generateDemandListCacheKey(query: FindDemandsQueryDto): string {
            const { page = 1, limit = 10, title } = query;
            return `demands_list_page${page}_limit${limit}_code${title || 'all'}`;
        }

    async getDemandById(id: number):Promise<DemandEntity| null>{
      const demand = await this.demandRepository.findOneBy({id})
      if(!demand){
        throw new NotFoundException(`demand with ${id} not found`);
      }
      return demand;
    }

    async getDemandByFlightNumber(flightNumber: string):Promise<DemandEntity[]| null>{
       const results = await this.demandRepository.findBy({flightNumber:flightNumber});
       if(!results){
          throw new NotFoundException(`No flight with number ${flightNumber} found`)
       }
       return results
    }

    async getAllDemands(query: FindDemandsQueryDto):Promise<PaginatedResponse<DemandEntity>>{
            //generate cache key
              const cacheKey = this.generateDemandListCacheKey(query);
              //add cache key to memory
              this.demandListCacheKeys.add(cacheKey)
        
              //get data from cache
              const getCachedData = await this.cacheManager.get<PaginatedResponse<DemandEntity>>(cacheKey);
                   if (getCachedData) {
                    console.log(`Cache Hit---------> Returning demands list from Cache ${cacheKey}`)
                    return getCachedData
                }
                console.log(`Cache Miss---------> Returning roles list from database`)
                const { page = 1, limit = 10, title } = query;
                const skip = (page - 1) * limit;
                const queryBuilder = this.demandRepository.createQueryBuilder('demand')
                .orderBy('demand.created_at', 'DESC').skip(skip).take(limit)
        
                if (title) {
                    queryBuilder.andWhere('demand.code ILIKE :title', { title: `%${title}%` })
                }
        
                const [items, totalItems] = await queryBuilder.getManyAndCount();
        
                const totalPages = Math.ceil(totalItems / limit);
        
                const responseResult = {
                    items,
                    meta: {
                        currentPage: page,
                        itemsPerPage: limit,
                        totalItems,
                        totalPages,
                        hasPreviousPage: page > 1,
                        hasNextPage: page < totalPages
                    }
                }
                await this.cacheManager.set(cacheKey, responseResult, 30000);
                return responseResult;
        
    }

    async publishDemand(user:UserEntity, createDemandDto:CreateDemandDto):Promise<DemandEntity>{
      //check if user account is verified
      if(!user.isVerified){
        throw new BadRequestException('Your account is not verified')
      }
      //check if the user has already published a demand with the same flight number
      const existingDemand = await this.demandRepository.findOne({
        where:{flightNumber:createDemandDto.flightNumber}
      })
      if(existingDemand){
        throw new BadRequestException('You have already published a demand with the same flight number')
      }
     const newDemand = await this.demandRepository.create({
        userId: user.id,
        title:createDemandDto.title,
        description:createDemandDto.description,
        flightNumber: createDemandDto.flightNumber,
        originAirportId:createDemandDto.originAirportId,
        destinationAirportId:createDemandDto.destinationAirportId,
        deliveryDate:createDemandDto.deliveryDate,
        weight:createDemandDto.weight,
        pricePerKg: createDemandDto.pricePerKg,
        createdBy:user.id,
        user:user
     })
      return await this.demandRepository.save(newDemand);
    }

    /*async updateDemand(user:UserEntity,createDemandDto:CreateDemandDto):Promise<DemandEntity>{
     
    }*/


    async getDemandByUser(id: number):Promise<DemandEntity[]>{
        const demands = await this.demandRepository.find({
            where:{userId: id},
            relations:['user', 'requests']
        })
        if(!demands){
         throw new NotAcceptableException(`User has no demands`)
        }

        return demands;
    }


async softDeleteDemandByUser(id: number): Promise<DemandEntity> {
  const demand = await this.demandRepository.findOne({
    where: { id },
    relations: ['requests', 'requests.requestStatusHistory', 'requests.requestStatusHistory.requestStatuses'],
  });

  if (!demand) {
    throw new NotFoundException(`No demand with id ${id} found`);
  }

  for (const request of demand.requests) {
    // Defensive: skip if no status history
    if (!request.requestStatusHistory || request.requestStatusHistory.length === 0) continue;

    // Get the most recent status history based on creation timestamp
    const sortedHistory = [...request.requestStatusHistory].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );

    const latestStatus = sortedHistory[0]?.requestStatus?.status;

    if (latestStatus === 'ACCEPTED') {
      throw new BadRequestException(
        `Cannot delete this demand because one of its requests was already accepted.`
      );
    }
  }

  // Soft-delete by changing status
  demand.status = 'cancelled';
  return this.demandRepository.save(demand);
}


//get demands by airport
async getDemandsByDepartureAirport(airportId: number): Promise<DemandEntity[]> {
  return this.demandRepository.find({
    where: { originAirportId: airportId },
    relations: ['user']
  });
}


findOne(arg0: { where: { id: number }; }): Promise<DemandEntity | null> {
  return this.demandRepository.findOne({
    where: arg0.where
  });
}

save(demand: DemandEntity): Promise<DemandEntity> {
  return this.demandRepository.save(demand);
}
}


