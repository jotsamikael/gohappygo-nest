import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { DemandService } from './demand.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorattor';
import { CreateDemandDto } from './dto/createDemand.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/role.decorators';
import { RolesGuard } from 'src/auth/guards/roles-guard';
import { UserRole } from 'src/user/user.entity';
import { FindDemandsQueryDto } from './dto/FindDemandsQuery.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateDemandResponseDto, DemandResponseDto, PaginatedDemandsResponseDto } from './dto/demand-response.dto';

@ApiTags('demands')
@Controller('demand')
export class DemandController {

    constructor(private readonly demandService: DemandService) { }

    @Post()
    @UseGuards(JwtAuthGuard) //must be connected
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Publish a demand' })
    @ApiBody({ type: CreateDemandDto })
    @ApiResponse({ status: 201, description: 'Demand published successfully', type: CreateDemandResponseDto })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async publishDemand(@CurrentUser() user: any, @Body() createDemandDto: CreateDemandDto) {
        return await this.demandService.publishDemand(user, createDemandDto)
    }

     // Single GET endpoint that handles all filtering scenarios
     @Get()
     @UseGuards(JwtAuthGuard)
     @ApiBearerAuth('JWT-auth')
     @ApiOperation({
         summary: 'Get demands with flexible filtering',
         description: `
         Retrieve demands with various filter options:
         - No filters: Returns all demands (admin and operators only)
         - userId: Returns demands for specific user
         - flightNumber: Returns demands for specific flight
         - originAirportId: Returns demands from specific airport
         - destinationAirportId: Returns demands to specific airport
         - status: Returns demands with specific status
         - title: Search demands by title
         - deliveryDate: Filter by delivery date
         
         Supports pagination and sorting.
         `
     })
     @ApiResponse({ status: 200, description: 'Demands fetched successfully', type: PaginatedDemandsResponseDto })
     @ApiResponse({ status: 400, description: 'Bad request' })
     @ApiResponse({ status: 401, description: 'Unauthorized' })
     @ApiResponse({ status: 403, description: 'Forbidden - Admin access required for certain operations' })
     async getDemands(
         @Query() query: FindDemandsQueryDto,
         @CurrentUser() user: any
     ) {
         // Fix: Check the correct role structure
         const isAdmin = user.role?.code === UserRole.ADMIN;
         const isOperator = user.role?.code === UserRole.OPERATOR;

         
          //Auto-set userId to current user if not admin/operator and no userId specified
         if (!isAdmin && !isOperator && !query.userId) {
             query.userId = user.id;
         }
         
                
         return await this.demandService.getDemands(query);
     }

   

   


   


  
}
