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


async getDemands(query: FindDemandsQueryDto): Promise<PaginatedResponse<DemandEntity>> {
  
  const cacheKey = this.generateDemandListCacheKey(query);
  this.demandListCacheKeys.add(cacheKey);

  // Check cache first
  const cachedData = await this.cacheManager.get<PaginatedResponse<DemandEntity>>(cacheKey);
  if (cachedData) {
      console.log(`Cache Hit---------> Returning demands list from Cache ${cacheKey}`);
      return cachedData;
  }

  console.log(`Cache Miss---------> Returning demands list from database`);

  const { 
      page = 1, 
      limit = 10, 
      title, 
      flightNumber, 
      originAirportId, 
      destinationAirportId, 
      userId, 
      status, 
      deliveryDate, 
      orderBy = 'createdAt:desc' 
  } = query;

  const skip = (page - 1) * limit;
  
  // First, let's check if there are any demands at all
  const totalDemandsInDB = await this.demandRepository.count();
  
  // Build the query step by step to avoid complex joins that might cause issues
  const queryBuilder = this.demandRepository.createQueryBuilder('demand')
      .skip(skip)
      .take(limit);

  // Apply filters
  if (title) {
      queryBuilder.andWhere('LOWER(demand.title) LIKE LOWER(:title)', { title: `%${title}%` });
  }

  if (flightNumber) {
      queryBuilder.andWhere('demand.flightNumber = :flightNumber', { flightNumber });
      console.log('Added flightNumber filter:', flightNumber);
  }

  if (originAirportId) {
      queryBuilder.andWhere('demand.originAirportId = :originAirportId', { originAirportId });
      console.log('Added originAirportId filter:', originAirportId);
  }

  if (destinationAirportId) {
      queryBuilder.andWhere('demand.destinationAirportId = :destinationAirportId', { destinationAirportId });
      console.log('Added destinationAirportId filter:', destinationAirportId);
  }

  if (userId) {
      queryBuilder.andWhere('demand.userId = :userId', { userId });
      console.log('Added userId filter:', userId);
  }

  if (status) {
      queryBuilder.andWhere('demand.status = :status', { status });
      console.log('Added status filter:', status);
  }

  if (deliveryDate) {
      queryBuilder.andWhere('DATE(demand.deliveryDate) = DATE(:deliveryDate)', { deliveryDate });
      console.log('Added deliveryDate filter:', deliveryDate);
  }

  // Apply sorting
  const [sortField, sortDirection] = orderBy.split(':');
  const validSortFields = ['createdAt', 'deliveryDate', 'pricePerKg', 'weight'];
  const validSortDirections = ['asc', 'desc'];
  
  if (validSortFields.includes(sortField) && validSortDirections.includes(sortDirection)) {
      queryBuilder.orderBy(`demand.${sortField}`, sortDirection.toUpperCase() as 'ASC' | 'DESC');
      console.log('Added sorting:', `${sortField}:${sortDirection}`);
  } else {
      queryBuilder.orderBy('demand.createdAt', 'DESC'); // default
      console.log('Added default sorting: createdAt:DESC');
  }

  // Get the count first (without joins to avoid complex queries)
  const totalItems = await queryBuilder.getCount();
  
  // Now add the joins for the actual data
  queryBuilder
      .leftJoinAndSelect('demand.user', 'user')
      .leftJoinAndSelect('demand.originAirport', 'originAirport')
      .leftJoinAndSelect('demand.destinationAirport', 'destinationAirport');

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
  };

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


findOne(arg0: { where: { id: number }; }): Promise<DemandEntity | null> {
  return this.demandRepository.findOne({
    where: arg0.where
  });
}

save(demand: DemandEntity): Promise<DemandEntity> {
  return this.demandRepository.save(demand);
}

private generateDemandListCacheKey(query: FindDemandsQueryDto): string {
  const { 
      page = 1, 
      limit = 10, 
      title, 
      flightNumber, 
      originAirportId, 
      destinationAirportId, 
      userId, 
      status, 
      deliveryDate, 
      orderBy = 'createdAt:desc' 
  } = query;
  
  return `demands_list_page${page}_limit${limit}_title${title || 'all'}_flight${flightNumber || 'all'}_origin${originAirportId || 'all'}_dest${destinationAirportId || 'all'}_user${userId || 'all'}_status${status || 'all'}_date${deliveryDate || 'all'}_order${orderBy}`;
}
}


