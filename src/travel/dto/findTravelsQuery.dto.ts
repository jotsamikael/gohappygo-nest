import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsISO8601, IsOptional, IsString, MaxLength } from "class-validator";
import { PaginationQueryDto } from "src/common/dto/pagination-query.dto";

export class FindTravelsQueryDto extends PaginationQueryDto{
    @ApiProperty({
        description: 'Title of the travel',
        example: 'Travel to London',
        minLength: 2,
        maxLength: 500,
        required: false
      })
    @IsOptional()
    @IsString({message:'Title must be a string'})
    @MaxLength(500,{message:'Title search can\'t be more than 500 characters'})
    title?:string;

    @ApiProperty({
      description: 'Filter by flight number',
      example: 'BA123',
      required: false
    })
    @IsOptional()
    @IsString()
    flightNumber?: string;
  
    @ApiProperty({
      description: 'Filter by departure airport ID',
      example: 1,
      required: false
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    departureAirportId?: number;
  
    @ApiProperty({
      description: 'Filter by arrival airport ID',
      example: 2,
      required: false
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    arrivalAirportId?: number;
  
    @ApiProperty({
      description: 'Filter by user ID (admin only)',
      example: 1,
      required: false
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    userId?: number;

    @ApiProperty({
      description: 'Filter by weight Available in kg',
      example: 3,
      required: false
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    weightAvailable?:number
  
    @ApiProperty({
      description: 'Filter by status',
      enum: ['active', 'expired', 'cancelled', 'resolved'],
      required: false
    })
    @IsOptional()
    @IsEnum(['active', 'expired', 'cancelled', 'resolved'])
    status?: string;
  
    @ApiProperty({
      description: 'Filter by delivery date (ISO 8601)',
      example: '2024-01-01T00:00:00Z',
      required: false
    })
    @IsOptional()
    @IsISO8601()
    deliveryDate?: string;
  
    @ApiProperty({
      description: 'Sort order (field:direction)',
      example: 'createdAt:desc',
      enum: ['createdAt:asc', 'createdAt:desc', 'arrivalDatetime:asc', 'arrivalDatetime:desc', 'pricePerKg:asc', 'pricePerKg:desc', 'weightAvailable:asc', 'weightAvailable:desc'],
      required: false
    })
    @IsOptional()
    @IsString()
    orderBy?: string;

}