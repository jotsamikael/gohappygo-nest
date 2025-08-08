import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateRequestToTravelDto {

  @ApiProperty({
    description: 'Travel id',
    example: 1,
    minLength: 1,
    maxLength: 10
  })
  @IsNotEmpty()
  @IsNumber()
  travelId: number;

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
  @IsNumber()
  @IsNotEmpty()
  offerPrice: number;

  @ApiProperty({
    description: 'Package description',
    example: 'I need to send a package from New York to London',
    minLength: 2,
    maxLength: 2500
  })
  @IsNotEmpty()
  @IsString()
  packageDescription: string;

  @ApiProperty({
    description: 'Weight',
    example: 10,
    minLength: 1,
    maxLength: 10
  })  
  @IsNumber()
  @IsNotEmpty()
  weight: number;
}
