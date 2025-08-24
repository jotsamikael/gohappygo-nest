import { BadRequestException, Inject, Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { TravelEntity } from './travel.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedResponse } from 'src/common/interfaces/paginated-reponse.interfaces';
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
                const { page = 1, 
                  limit = 10,
                   title,
                   flightNumber, 
      departureAirportId, 
      arrivalAirportId, 
      userId, 
      weightAvailable,
      status, 
      deliveryDate, 
      orderBy = 'createdAt:desc'
                   } = query;
                const skip = (page - 1) * limit;
                    // First, let's check if there are any travels at all
  const totalTravelsInDB = await this.travelRepository.count();
  



                const queryBuilder = this.travelRepository.createQueryBuilder('travel')
                .skip(skip).take(limit)
          // Apply filters

                if (title) {
                    queryBuilder.andWhere('LOWER(travel.title) LIKE LOWER(:title)', { title: `%${title}%` })
                }

                if (flightNumber) {
                  queryBuilder.andWhere('travel.flightNumber = :flightNumber', { flightNumber });
              }
            
              if (departureAirportId) {
                  queryBuilder.andWhere('travel.departureAirportId = :departureAirportId', { departureAirportId });
              }
            
              if (arrivalAirportId) {
                  queryBuilder.andWhere('travel.arrivalAirportId = :arrivalAirportId', { arrivalAirportId });
              }
            
              if (userId) {
                  queryBuilder.andWhere('travel.userId = :userId', { userId });
              }

              if (weightAvailable) {
                  queryBuilder.andWhere('travel.weightAvailable >= :weightAvailable', { weightAvailable });
              }

              if (status) {
                  queryBuilder.andWhere('travel.status = :status', { status });
              }

              if (deliveryDate) {
                  queryBuilder.andWhere('DATE(travel.arrivalDatetime) = DATE(:deliveryDate)', { deliveryDate });
              }

              // Apply sorting
              const [sortField, sortDirection] = orderBy.split(':');
              const validSortFields = ['createdAt', 'arrivalDatetime', 'pricePerKg', 'weightAvailable'];
              const validSortDirections = ['asc', 'desc'];
              
              if (validSortFields.includes(sortField) && validSortDirections.includes(sortDirection)) {
                  queryBuilder.orderBy(`travel.${sortField}`, sortDirection.toUpperCase() as 'ASC' | 'DESC');
                  console.log('Added sorting:', orderBy);
              } else {
                  queryBuilder.orderBy('travel.createdAt', 'DESC'); // default
                  console.log('Added default sorting: createdAt:DESC');
              }

              // Get the count first (without joins to avoid complex queries)
              const totalItems = await queryBuilder.getCount();
              
              // Now add the joins for the actual data
              queryBuilder
                  .leftJoinAndSelect('travel.user', 'user')
                  .leftJoinAndSelect('travel.departureAirport', 'departureAirport')
                  .leftJoinAndSelect('travel.arrivalAirport', 'arrivalAirport');

              const items = await queryBuilder.getMany();
              
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
      //check if user account is verified
      if(!user.isVerified){
        throw new BadRequestException('Your account is not verified')
      }
      //check if the user has already published a travel with the same flight number
      const existingTravel = await this.travelRepository.findOne({
        where:{flightNumber:createTravelDto.flightNumber}
      })
      if(existingTravel){
        throw new BadRequestException('You have already published a travel with the same flight number')
      }
     const newTravel = await this.travelRepository.create({
        userId: user.id,
        title: createTravelDto.title,
        flightNumber:createTravelDto.flightNumber,
        airline:createTravelDto.airline,
        departureAirportId: createTravelDto.departureAirportId,
        arrivalAirportId:createTravelDto.arrivalAirportId,
        departureDatetime: new Date(createTravelDto.departureDatetime),
        arrivalDatetime: new Date(createTravelDto.arrivalDatetime),
        pricePerKg:createTravelDto.pricePerKg,
        totalWeightAllowance:createTravelDto.totalWeightAllowance,  
        weightAvailable:createTravelDto.totalWeightAllowance,
        createdBy:user.id,
        status:'active',
        user:user
     })
      return await this.travelRepository.save(newTravel);
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
            `Cannot delete this travel because one of its requests was already accepted.`
          );
        }
      }

      // Soft-delete by changing status
      travel.status = 'cancelled';
      return this.travelRepository.save(travel);
    }

    async findOne(options: any): Promise<TravelEntity | null> {
      return await this.travelRepository.findOne(options);
  }

  async save(travel: TravelEntity): Promise<TravelEntity> {
      return await this.travelRepository.save(travel);
  }



    // Add this method to clear travel list cache
    private async clearTravelListCache(): Promise<void> {
        // Clear all travel list cache keys
        for (const cacheKey of this.travelListCacheKeys) {
            await this.cacheManager.del(cacheKey);
        }
        this.travelListCacheKeys.clear();
    }
}