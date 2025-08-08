// src/request/dto/create-request-to-demand.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateRequestToDemandDto {
  @ApiProperty({
    description: 'Demand id',
    example: 1,
    minLength: 1,
    maxLength: 10
  })
  @IsNotEmpty()
  @IsNumber()
  demandId: number; // Required - responding to a demand

  @ApiProperty({
    description: 'Request type',
    example: 'GoAndGive',
    minLength: 1,
    maxLength: 10
  })
  @IsNotEmpty()
  requestType: 'GoAndGive' | 'GoAndGo';

  @ApiProperty({
    description: 'Offer price',
    example: 10,
    minLength: 1,
    maxLength: 10
  })
  @IsNotEmpty()
  @IsNumber()
  offerPrice: number;

}