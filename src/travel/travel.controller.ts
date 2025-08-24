import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorattor';
import { Roles } from 'src/auth/decorators/role.decorators';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles-guard';
import { UserRole } from 'src/user/user.entity';
import { TravelService } from './travel.service';
import { FindTravelsQueryDto } from './dto/findTravelsQuery.dto';
import { CreateTravelDto } from './dto/createTravel.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateTravelResponseDto, TravelResponseDto } from './dto/travel-response.dto';

@ApiTags('travels')
@Controller('travel')
export class TravelController {

        constructor(private readonly travelService: TravelService){}
    
        @Post()
        @UseGuards(JwtAuthGuard) //must be connected
        @ApiBearerAuth('JWT-auth') 
        @ApiOperation({ summary: 'Publish a travel' })
        @ApiBody({ type: CreateTravelDto })
        @ApiResponse({ status: 201, description: 'Travel published successfully',type: CreateTravelResponseDto })
        @ApiResponse({ status: 400, description: 'Bad request' })
        async publishTravel(@CurrentUser() user: any, @Body() createTravelDto:CreateTravelDto){
        return await this.travelService.publishTravel(user, createTravelDto)
        }
    
    

        // Single GET endpoint that handles all filtering scenarios

        @Get('')
        @UseGuards(JwtAuthGuard) //guards the endpoint
        @ApiBearerAuth('JWT-auth') 
        @ApiOperation({ summary: 'Get all travels',
            description: `
            Retrieve travels with various filter options:
         - No filters: Returns all travels (admin and operators only)
         - userId: Returns travels for specific user
         - flightNumber: Returns travels for specific flight
         - originAirportId: Returns travels from specific airport
         - destinationAirportId: Returns travels to specific airport
         - status: Returns travels with specific status
         - title: Search travels by title
         - weightAvailable: Serach by available weight
         - deliveryDate: Filter by delivery date
         
         Supports pagination and sorting.
            `
         })
        @ApiResponse({ status: 200, description: 'Travels fetched successfully',type: TravelResponseDto })
        @ApiResponse({ status: 400, description: 'Bad request' })
        @ApiResponse({ status: 401, description: 'Unauthorized' })
        @ApiResponse({ status: 403, description: 'Forbidden - Admin access required for certain operations' })

        async getAll(@Query() query: FindTravelsQueryDto, @CurrentUser() user: any){
           // Fix: Check the correct role structure
         const isAdmin = user.role?.code === UserRole.ADMIN;
         const isOperator = user.role?.code === UserRole.OPERATOR;

         
          //Auto-set userId to current user if not admin/operator and no userId specified
         if (!isAdmin && !isOperator && !query.userId) {
             query.userId = user.id;
         }
         
           
        return await this.travelService.getAllTravels(query);
        }


 

}
