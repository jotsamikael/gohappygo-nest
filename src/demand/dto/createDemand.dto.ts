import { IsNotEmpty, IsString, MinLength, MaxLength, IsOptional, IsNumber } from "class-validator";

export class CreateDemandDto{

      @IsNotEmpty({ message: 'title can not be empty' })
      @IsString({ message: 'title must be a string' })
      @MinLength(2, { message: 'title must be atleast 2 charcters' })
      @MaxLength(500, { message: 'title can not exceed 500 charcters' })
      title: string;

      @IsOptional()
      flightNumber: string;
    
      @IsNotEmpty({ message: 'description can not be empty' })
      @IsString({ message: 'description must be a string' })
      @MinLength(2, { message: 'description must be atleast 2 charcters' })
      @MaxLength(2500, { message: 'description can not exceed 2500 charcters' })
      description: string;
    
      @IsNotEmpty()
      @IsNumber()
      originAirportId: number;
    
      @IsNotEmpty()
      @IsNumber()
      destinationAirportId: number;
    
      @IsNotEmpty({ message: 'delivery date can not be empty' })
      deliveryDate: Date;
    
      @IsNotEmpty({ message: 'weight can not be empty' })
      weight: number;
    
      @IsNotEmpty({ message: 'price Per Kg can not be empty' })
      pricePerKg: number;
}