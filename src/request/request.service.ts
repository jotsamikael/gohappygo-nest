import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RequestEntity } from './request.entity';
import { FindOptionsWhere, Repository } from 'typeorm';
import { UserEntity } from 'src/user/user.entity';
import { RequestStatusHistoryService } from 'src/request-status-history/request-status-history.service';
import { RequestStatusService } from 'src/request-status/request-status.service';
import { CreateRequestToTravelDto } from './dto/createRequestToTravel.dto';
import { CreateRequestToDemandDto } from './dto/createRequestToDemand.dto';
import { TravelService } from 'src/travel/travel.service';
import { DemandService } from 'src/demand/demand.service';

@Injectable()
export class RequestService {
  

  constructor(@InjectRepository(RequestEntity) private requestRepository: Repository<RequestEntity>,
    private requestStatusHistoryService: RequestStatusHistoryService,
    private requestStatusService: RequestStatusService,
    private travelService: TravelService,
    private demandService: DemandService,
  ) { }


  //createRequest to seek travel
  async createRequestToTravel(createRequestDto: CreateRequestToTravelDto, user: UserEntity): Promise<RequestEntity> {

    const request = this.requestRepository.create({
      travelId: createRequestDto.travelId,
      demandId: null,
      requestType: createRequestDto.requestType,
      offerPrice: createRequestDto.offerPrice,
      packageDescription: createRequestDto.packageDescription,
      weight: createRequestDto.weight,
      requester: user
    })

    const reqStatus = await this.requestStatusService.getRequestByStatus('NEGOTIATING');
    request.currentStatusId = reqStatus!.id;
    
    const savedRequest = await this.requestRepository.save(request);

    //add a request status history record
    this.requestStatusHistoryService.record(request.id, reqStatus!.id)
    return savedRequest;

  }


// Add this method to your RequestService class
async createRequestToDemand(createRequestDto: CreateRequestToDemandDto, user: UserEntity): Promise<RequestEntity> {
  const request = this.requestRepository.create({
    demandId: createRequestDto.demandId,
    travelId: null,
    requestType: createRequestDto.requestType,
    offerPrice: createRequestDto.offerPrice,
    packageDescription: "",
    weight: null,
    requester: user
  })

  const reqStatus = await this.requestStatusService.getRequestByStatus('NEGOTIATING');
  request.currentStatusId = reqStatus!.id;
  
  const savedRequest = await this.requestRepository.save(request);

  //add a request status history record
  this.requestStatusHistoryService.record(request.id, reqStatus!.id)
  return savedRequest;
}


  //Get all Requests of a User
  async getRequestsByUser(userId: number): Promise<RequestEntity[]> {
    return this.requestRepository.find({
      where: { requester: { id: userId } },
      relations: ['demand', 'travel', 'requestStatusHistory', 'transactions', 'messages'],
      order: { createdAt: 'DESC' },
    });
  }

  //Get a Request by ID
  async getRequestById(id: number): Promise<RequestEntity | null> {
    return await this.requestRepository.findOne({
      where: { id },
      relations: ['demand', 'travel', 'requestStatusHistory', 'transactions', 'messages'],
    });
  }

  async findOne(arg: FindOptionsWhere<RequestEntity>): Promise<RequestEntity | null> {
    return await this.requestRepository.findOne({
      where:arg,
      relations: ['demand', 'travel', 'requestStatusHistory', 'transactions', 'messages'],
    });
  }

  // src/request/request.service.ts

// Add this method to your RequestService class
async acceptRequest(requestId: number, user: UserEntity): Promise<RequestEntity> {
  // 1. Find the request with all necessary relations
  const request = await this.requestRepository.findOne({
    where: { id: requestId },
    relations: ['demand', 'travel', 'demand.user', 'travel.user']
  });

  if (!request) {
    throw new NotFoundException('Request not found');
  }

  // 2. Check if the user is authorized to accept this request
  // User must be the creator of either the demand or travel
  const isAuthorized = 
    (request.demand && request.demand.user.id === user.id) ||
    (request.travel && request.travel.user.id === user.id);

  if (!isAuthorized) {
    throw new ForbiddenException('Only the creator of the demand or travel can accept requests');
  }

  // 3. Get the "ACCEPTED" status
  const acceptedStatus = await this.requestStatusService.getRequestByStatus('ACCEPTED');
  if (!acceptedStatus) {
    throw new NotFoundException('Accepted status not found');
  }

  // 4. Update request status
  request.currentStatusId = acceptedStatus.id;
  await this.requestRepository.save(request);

  // 5. Add status history record
  await this.requestStatusHistoryService.record(requestId, acceptedStatus.id);

  // 6. Handle business logic based on request type
  if (request.travelId) {
    // Request was addressed to a travel - update travel weight
    await this.handleTravelRequestAcceptance(request);
  } else if (request.demandId) {
    // Request was addressed to a demand - update demand status
    await this.handleDemandRequestAcceptance(request);
  }

  return request;
}

// Helper method for travel requests
private async handleTravelRequestAcceptance(request: RequestEntity): Promise<void> {
  const travel = await this.travelService.findOne({
    where: { id: request.travelId! }
  });

  if (!travel) {
    throw new NotFoundException('Travel not found');
  }

  // Subtract the request weight from available weight
  const newAvailableWeight = travel.weightAvailable - (request.weight || 0);
  
  if (newAvailableWeight < 0) {
    throw new BadRequestException('Insufficient weight available in travel');
  }

  // Update travel weight
  travel.weightAvailable = newAvailableWeight;

  // Check if travel is now filled
  if (newAvailableWeight === 0) {
    travel.status = 'filled';
  }

  await this.travelService.save(travel);
}

// Helper method for demand requests
private async handleDemandRequestAcceptance(request: RequestEntity): Promise<void> {
  const demand = await this.demandService.findOne({
    where: { id: request.demandId! }
  });

  if (!demand) {
    throw new NotFoundException('Demand not found');
  }

  // Update demand status to resolved
  demand.status = 'resolved';
  await this.demandService.save(demand);
}
}
