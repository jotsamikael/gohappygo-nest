import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorattor';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserRole } from 'src/user/user.entity';
import { DemandAndTravelService } from './demand-and-travel.service';
import { FindDemandsAndTravelsQueryDto } from './dto/FindDemandsAndTravelsQuery.dto';
import { PaginatedDemandsAndTravelsResponseDto } from './dto/demand-and-travel-response.dto';

@ApiTags('demandsAndTravels')
@Controller('demand-and-travel')
export class DemandAndTravelController {
    constructor(private demandAndTravelService: DemandAndTravelService) {}

    @Get()
    @ApiOperation({
        summary: 'Get demands and travels with flexible filtering',
        description: `
        Retrieve demands and travels with various filter options:
        - No filters: Returns all demands and travels
        - userId: Returns demands and travels for specific user
        - flightNumber: Returns demands and travels for specific flight
        - originAirportId: Returns demands and travels from specific airport
        - destinationAirportId: Returns demands and travels to specific airport
        - status: Returns demands and travels with specific status
        - weightAvailable: Search by available weight (travels only)
        - deliveryDate: Filter by delivery date
        
        Supports pagination and sorting.
        `
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Demands and travels fetched successfully', 
        type: PaginatedDemandsAndTravelsResponseDto 
    })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required for certain operations' })
    async getDemandsAndTravels(
        @Query() query: FindDemandsAndTravelsQueryDto,
        @CurrentUser() user: any
    ) {
        return await this.demandAndTravelService.getDemandsAndTravels(query);
    }
}
