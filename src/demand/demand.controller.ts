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

    //get demands of currently logged-in user
    @Get('/current-user')
    @UseGuards(JwtAuthGuard) //must be connected
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get demands of current user' })
    @ApiResponse({ status: 200, description: 'Demands fetched successfully', type: DemandResponseDto })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async getDemandOfUserCurrentUser(@CurrentUser() user: any) {
        return await this.demandService.getDemandByUser(user.id)
    }

    //Admin gets demands by of any user
    @Get('/by-user/:id')
    @Roles(UserRole.ADMIN)//sets the required role to acces endpoint
    @UseGuards(JwtAuthGuard, RolesGuard) //guards the endpoint
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get demands of a user' })
    @ApiResponse({ status: 200, description: 'Demands fetched successfully', type: DemandResponseDto })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async getDemandByUser(@Param('id', ParseIntPipe) id: number) {
        return await this.demandService.getDemandByUser(id)
    }

    //Admin list all demands
    @Get('')
    @Roles(UserRole.ADMIN)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Get all demands (Admin only)',
        description: 'Retrieve all demands with pagination and optional filtering. Admin access required.'
    })
    @ApiResponse({ status: 200, description: 'Demands fetched successfully', type: PaginatedDemandsResponseDto })
    @ApiResponse({ status: 400, description: 'Bad request' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
    async getAll(@Query() query: FindDemandsQueryDto) {
        return await this.demandService.getAllDemands(query);
    }


    // gets demands by of flight number user
    @Get('/by-flight-number/:flight')
    @UseGuards(JwtAuthGuard) //must be connected
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get demands by flight number' })
    @ApiResponse({ status: 200, description: 'Demands fetched successfully', type: DemandResponseDto })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async getDemandByFlightNumber(@Param('flight') flight: string) {
        return await this.demandService.getDemandByFlightNumber(flight)
    }


    @Get('/by-airport/:airportId')
    @Roles(UserRole.ADMIN)//sets the required role to acces endpoint
    @UseGuards(JwtAuthGuard, RolesGuard) //guards the endpoint
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Get demands by departure airport' })
    @ApiResponse({ status: 200, description: 'Demands fetched successfully', type: DemandResponseDto })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async getDemandsByAirport(@Param('airportId', ParseIntPipe) airportId: number) {
        return await this.demandService.getDemandsByDepartureAirport(airportId)
    }
}
