import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, MaxLength, MinLength, IsDateString } from 'class-validator';

export class CreateTravelDto {
  @ApiProperty({
    description: 'Title of the travel',
    example: 'Travel to London',
    minLength: 2,
    maxLength: 500
  })
  @IsNotEmpty({ message: 'title can not be empty' })
  @IsString({ message: 'title must be a string' })
  @MinLength(2, { message: 'title must be atleast 2 charcters' })
  @MaxLength(500, { message: 'title can not exceed 500 charcters' })
  title: string;

  @ApiProperty({
    description: 'Flight number of the travel',
    example: 'BA123',
    minLength: 2,
    maxLength: 20
  })
  @IsNotEmpty({ message: 'flightNumber can not be empty' })
  @IsString({ message: 'flightNumber must be a string' })
  @MinLength(2, { message: 'flightNumber must be atleast 2 charcters' })
  @MaxLength(20, { message: 'flightNumber can not exceed 20 charcters' })
  flightNumber: string;

  @ApiProperty({
    description: 'Airline of the travel',
    example: 'British Airways',
    minLength: 2,
    maxLength: 50
  })
  @IsNotEmpty({ message: 'airline can not be empty' })
  @IsString({ message: 'airline must be a string' })
  @MinLength(2, { message: 'airline must be atleast 2 charcters' })
  @MaxLength(50, { message: 'airline can not exceed 50 charcters' })
  airline: string;

  @ApiProperty({
    description: 'Departure airport id',
    example: 1
  })
  @IsNotEmpty({ message: 'departureAirportId can not be empty' })
  @IsNumber({}, { message: 'departureAirportId must be a number' })
  departureAirportId: number;

  @ApiProperty({
    description: 'Arrival airport id',
    example: 2
  })
  @IsNotEmpty({ message: 'arrivalAirportId can not be empty' })
  @IsNumber({}, { message: 'arrivalAirportId must be a number' })
  arrivalAirportId: number;

  @ApiProperty({
    description: 'Departure datetime',
    example: '2025-01-01T10:00:00Z'
  })
  @IsNotEmpty({ message: 'departureDatetime can not be empty' })
  @IsDateString({}, { message: 'departureDatetime must be a valid date string' })
  departureDatetime: string;

  @ApiProperty({
    description: 'Arrival datetime',
    example: '2025-01-01T12:00:00Z'
  })
  @IsNotEmpty({ message: 'arrivalDatetime can not be empty' })
  @IsDateString({}, { message: 'arrivalDatetime must be a valid date string' })
  arrivalDatetime: string;

  @ApiProperty({
    description: 'Price per kg',
    example: 25.50
  })
  @IsNotEmpty({ message: 'pricePerKg can not be empty' })
  @IsNumber({}, { message: 'pricePerKg must be a number' })
  pricePerKg: number;

  @ApiProperty({
    description: 'Total weight allowance in kg',
    example: 50.0
  })
  @IsNotEmpty({ message: 'totalWeightAllowance can not be empty' })
  @IsNumber({}, { message: 'totalWeightAllowance must be a number' })
  totalWeightAllowance: number;

  @ApiProperty({
    description: 'Weight available in kg (initially equals totalWeightAllowance)',
    example: 50.0
  })
  @IsNotEmpty({ message: 'weightAvailable can not be empty' })
  @IsNumber({}, { message: 'weightAvailable must be a number' })
  weightAvailable: number;
}