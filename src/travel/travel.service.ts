import { BadRequestException, Inject, Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { TravelEntity } from './travel.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedResponse } from 'src/common/interfaces/paginated-reponse.interfaces';
import { DemandEntity } from 'src/demand/demand.entity';
import { FindDemandsQueryDto } from 'src/demand/dto/FindDemandsQuery.dto';
import { UserEntity } from 'src/user/user.entity';
import { Repository } from 'typeorm';
import { FindTravelsQueryDto } from './dto/findTravelsQuery.dto';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CreateTravelDto } from './dto/createTravel.dto';

@Injectable()
export class TravelService {
 
       
      private travelListCacheKeys: Set<string> = new Set();

    constructor(@InjectRepository(TravelEntity) private travelRepository: Repository<TravelEntity>,
     @Inject(CACHE_MANAGER) private cacheManager: Cache
){}

 private generateTravelsListCacheKey(query: FindTravelsQueryDto): string {
            const { page = 1, limit = 10, title } = query;
            return `travels_list_page${page}_limit${limit}_code${title || 'all'}`;
        }

    async getTravelById(id: number):Promise<TravelEntity| null>{
      const travel = await this.travelRepository.findOneBy({id})
      if(!travel){
        throw new NotFoundException(`travel with ${id} not found`);
      }
      return travel;
    }

    async getTravelsByFlightNumber(flightNumber: string): Promise<TravelEntity[]>{
      const travels = await this.travelRepository.findBy({flightNumber:flightNumber});
      if(!travels){
        throw new NotFoundException(`No travel with flight number: ${flightNumber} not found`);
      }

      return travels;
    }

    async getAllTravels(query: FindTravelsQueryDto):Promise<PaginatedResponse<TravelEntity>>{
            //generate cache key
              const cacheKey = this.generateTravelsListCacheKey(query);
              //add cache key to memory
              this.travelListCacheKeys.add(cacheKey)
        
              //get data from cache
              const getCachedData = await this.cacheManager.get<PaginatedResponse<TravelEntity>>(cacheKey);
                   if (getCachedData) {
                    console.log(`Cache Hit---------> Returning travels list from Cache ${cacheKey}`)
                    return getCachedData
                }
                console.log(`Cache Miss---------> Returning travels list from database`)
                const { page = 1, limit = 10, title } = query;
                const skip = (page - 1) * limit;
                const queryBuilder = this.travelRepository.createQueryBuilder('travel')
                .orderBy('travel.created_at', 'DESC').skip(skip).take(limit)
        
                if (title) {
                    queryBuilder.andWhere('travel.code ILIKE :title', { title: `%${title}%` })
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

    async publishTravel(user:UserEntity, createTravelDto:CreateTravelDto):Promise<TravelEntity>{
     const newDemand = await this.travelRepository.create({
        userId: user.id,
        title: createTravelDto.title,
        flightNumber:createTravelDto.flightNumber,
        airline:createTravelDto.airline,
        departureAirportId:createTravelDto.departureAirportId,
        arrivalAirportId:createTravelDto.arrivalAirportId,
        departureDatetime:createTravelDto.departureDatetime,
        arrivalDatetime:createTravelDto.arrivalDatetime,
        user:user
     })
      return await this.travelRepository.save(newDemand);
    }


    /*async updateDemand(user:UserEntity,createDemandDto:CreateDemandDto):Promise<DemandEntity>{
     
    }*/


    async getTravelByUser(id: number):Promise<TravelEntity[]>{
        const demands = await this.travelRepository.find({
            where:{userId: id},
            relations:['user', 'request']
        })
        if(!demands){
         throw new NotAcceptableException(`User has no demands`)
        }

        return demands;
    }


async softDeleteTravel(id: number): Promise<TravelEntity> {
  const travel = await this.travelRepository.findOne({
    where: { id },
    relations: ['requests', 'requests.requestStatusHistory', 'requests.requestStatusHistory.requestStatuses'],
  });

  if (!travel) {
    throw new NotFoundException(`No travel with id ${id} found`);
  }

  for (const request of travel.requests) {
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
  travel.status = 'cancelled';
  return this.travelRepository.save(travel);
}


//get travels by airport
async getTravelsByAirport(airportId: number): Promise<TravelEntity[]> {
  return this.travelRepository.find({
    where: { departureAirportId: airportId },
    relations: ['user']
  });
}

findOne(arg0: { where: { id: number }; }): Promise<TravelEntity | null> {
  return this.travelRepository.findOne({
    where: arg0.where
  });
}

save(travel: TravelEntity): Promise<TravelEntity> {
  return this.travelRepository.save(travel);
}
}