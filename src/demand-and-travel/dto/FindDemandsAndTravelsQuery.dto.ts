import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength, IsEnum, IsInt, Min, Max, IsISO8601 } from "class-validator";
import { Type } from "class-transformer";
import { PaginationQueryDto } from "src/common/dto/pagination-query.dto";

export class FindDemandsAndTravelsQueryDto extends PaginationQueryDto {
  @ApiProperty({
    description: 'Filter by title (searches both demands and travels)',
    example: 'Package delivery from New York',
    minLength: 2,
    maxLength: 500,
    required: false
  })
  @IsOptional()
  @IsString({message:'Title must be a string'})
  @MaxLength(500,{message:'Title search can\'t be more than 500 characters'})
  title?: string;

  @ApiProperty({
    description: 'Filter by flight number (searches both demands and travels)',
    example: 'BA123',
    required: false
  })
  @IsOptional()
  @IsString()
  flightNumber?: string;

  @ApiProperty({
    description: 'Filter by origin airport ID (searches both demands and travels)',
    example: 1,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  departureAirportId?: number;

  @ApiProperty({
    description: 'Filter by destination airport ID (searches both demands and travels)',
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
    description: 'Filter by status (searches both demands and travels)',
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
    description: 'Filter by weight available (travels only)',
    example: 3,
    required: false
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  weightAvailable?: number;

  @ApiProperty({
    description: 'Sort order (field:direction)',
    example: 'createdAt:desc',
    enum: ['createdAt:asc', 'createdAt:desc', 'deliveryDate:asc', 'deliveryDate:desc', 'title:asc', 'title:desc', 'flightNumber:asc', 'flightNumber:desc'],
    required: false
  })
  @IsOptional()
  @IsString()
  orderBy?: string;
}