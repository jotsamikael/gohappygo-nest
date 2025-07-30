// src/request/dto/create-request-to-demand.dto.ts
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateRequestToDemandDto {
  @IsNotEmpty()
  @IsNumber()
  demandId: number; // Required - responding to a demand

  @IsNotEmpty()
  requestType: 'GoAndGive' | 'GoAndGo';

  @IsNotEmpty()
  @IsNumber()
  offerPrice: number;

}