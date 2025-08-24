import { ApiProperty } from '@nestjs/swagger';
import { PaginatedResponse } from 'src/common/interfaces/paginated-reponse.interfaces';

export class DemandOrTravelResponseDto {
  @ApiProperty({ description: 'Unique identifier' })
  id: number;

  @ApiProperty({ description: 'Type of item (demand or travel)', enum: ['demand', 'travel'] })
  type: 'demand' | 'travel';

  @ApiProperty({ description: 'Title of the demand or travel' })
  title: string;

  @ApiProperty({ description: 'Flight number' })
  flightNumber: string;

  @ApiProperty({ description: 'Origin airport ID' })
  departureAirportId: number;

  @ApiProperty({ description: 'Destination airport ID' })
  arrivalAirportId: number;

  @ApiProperty({ description: 'User ID who created this item' })
  userId: number;

  @ApiProperty({ description: 'Status of the item', enum: ['active', 'expired', 'cancelled', 'resolved'] })
  status: string;

  @ApiProperty({ description: 'Delivery date' })
  deliveryDate: Date;

  @ApiProperty({ description: 'Creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Last update date' })
  updatedAt: Date;

  @ApiProperty({ description: 'Weight (demands only)', required: false })
  weight?: number;

  @ApiProperty({ description: 'Price per kg (demands only)', required: false })
  pricePerKg?: number;

  @ApiProperty({ description: 'Weight available (travels only)', required: false })
  weightAvailable?: number;

  @ApiProperty({ description: 'Whether the item is deactivated' })
  isDeactivated: boolean;
}

export class PaginatedDemandsAndTravelsResponseDto implements PaginatedResponse<DemandOrTravelResponseDto> {
  @ApiProperty({ type: [DemandOrTravelResponseDto], description: 'Array of demands and travels' })
  items: DemandOrTravelResponseDto[];

  @ApiProperty({ description: 'Pagination metadata' })
  meta: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}
