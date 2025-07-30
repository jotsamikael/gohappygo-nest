import { IsNotEmpty, IsNumber, IsString, MaxLength, MinLength } from 'class-validator';
import { Column } from 'typeorm';

export class CreateTravelDto {
  @IsNotEmpty({ message: 'title can not be empty' })
  @IsString({ message: 'title must be a string' })
  @MinLength(2, { message: 'title must be atleast 2 charcters' })
  @MaxLength(500, { message: 'title can not exceed 500 charcters' })
  title: string;

  @IsNotEmpty({ message: 'flightNumber can not be empty' })
  @IsString({ message: 'flightNumber must be a string' })
  @MinLength(2, { message: 'flightNumber must be atleast 2 charcters' })
  @MaxLength(20, { message: 'flightNumber can not exceed 20 charcters' })
  flightNumber: string;

  airline: string;

  @IsNotEmpty()
  @IsNumber()
  departureAirportId: number;

  @IsNotEmpty()
  @IsNumber()
  arrivalAirportId: number;

  @IsNotEmpty({ message: 'departureDatetime can not be empty' })
  departureDatetime: Date;

  arrivalDatetime: Date;

  @IsNotEmpty({ message: 'totalWeightAllowance can not be empty' })
  totalWeightAllowance: number;

  @IsNotEmpty({ message: 'weightAvailable can not be empty' })
  weightAvailable: number;
}
