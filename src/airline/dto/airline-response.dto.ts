import { ApiProperty } from "@nestjs/swagger";
import { FlightResponseDto } from "src/flight/dto/flight-response.dto";

export class AirlineResponseDto {
    @ApiProperty({ example: 1 })
    id: number;
  
    @ApiProperty({ example: 'Air France' })
    name: string;
  
    @ApiProperty({ example: 'AFR' })
    icaoCode: string;

    @ApiProperty({ example: 'AF' })
    iataCode: string;

    @ApiProperty({ example: 'AF' })
    prefix: string;

    @ApiProperty({ example: 18 })
    fleetSize: number;

    @ApiProperty({ example: 23})
    destinationsCount: number;

    @ApiProperty({ example: 'https://en.wikipedia.org/wiki/Air_France' })
    wikipediaUrl: string;
  
    @ApiProperty({ example: 'https://example.com/profile.jpg' })
    logoUrl: string | null;

    @ApiProperty({ type: [FlightResponseDto] })
    flights: FlightResponseDto[];

  
    @ApiProperty({ example: false })
    isDeactivated: boolean;

  
    @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
    createdAt: Date;
  
    @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
    updatedAt: Date;
  }



export class PaginatedAirlinesResponseDto{
    @ApiProperty({ type: [AirlineResponseDto] })
    data: AirlineResponseDto[];
  
    @ApiProperty({ example: 100 })
    total: number;
  
    @ApiProperty({ example: 1 })
    page: number;
  
    @ApiProperty({ example: 10 })
    limit: number;
  
    @ApiProperty({ example: 10 })
    totalPages: number;
  }