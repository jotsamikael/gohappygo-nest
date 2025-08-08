import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength, MaxLength, IsOptional, IsNumber } from "class-validator";

export class CreateDemandDto{
      @ApiProperty({
        description: 'Title of the demand',
        example: 'I need to send a package from New York to London',
        minLength: 2,
        maxLength: 500
      })
      @IsNotEmpty({ message: 'title can not be empty' })
      @IsString({ message: 'title must be a string' })
      @MinLength(2, { message: 'title must be atleast 2 charcters' })
      @MaxLength(500, { message: 'title can not exceed 500 charcters' })
      title: string;

      @ApiProperty({
        description: 'Flight number of the demand',
        example: 'BA123',
        minLength: 2,
        maxLength: 50
      })
      @IsOptional()
      flightNumber: string;
    
      @ApiProperty({
        description: 'Description of the demand',
        example: 'I need to send a package from New York to London',
        minLength: 2,
        maxLength: 2500
      })
      @IsNotEmpty({ message: 'description can not be empty' })
      @IsString({ message: 'description must be a string' })
      @MinLength(2, { message: 'description must be atleast 2 charcters' })
      @MaxLength(2500, { message: 'description can not exceed 2500 charcters' })
      description: string;
    
      @ApiProperty({
        description: 'Origin airport id',
        example: 1,
        minLength: 1,
        maxLength: 10
      })
      @IsNotEmpty()
      @IsNumber()
      originAirportId: number;
    
      @ApiProperty({
        description: 'Destination airport id',
        example: 2,
        minLength: 1,
        maxLength: 10
      })
      @IsNotEmpty()
      @IsNumber()
      destinationAirportId: number;
    
      @ApiProperty({
        description: 'Delivery date',
        example: '2025-01-01',
        minLength: 1,
        maxLength: 10
      })
      @IsNotEmpty({ message: 'delivery date can not be empty' })
      deliveryDate: Date;
    
      @ApiProperty({
        description: 'Weight of the demand',
        example: 10,
        minLength: 1,
        maxLength: 10
      })
      @IsNotEmpty({ message: 'weight can not be empty' })
      weight: number;
    
      @ApiProperty({
        description: 'Price per kg',
        example: 10,
        minLength: 1,
        maxLength: 10
      })
      @IsNotEmpty({ message: 'price Per Kg can not be empty' })
      pricePerKg: number;
}