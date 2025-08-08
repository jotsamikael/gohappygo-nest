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
    
        //get demands of currently logged-in user
        @Get('/current-user')
        @UseGuards(JwtAuthGuard) //must be connected
        @ApiBearerAuth('JWT-auth') 
        @ApiOperation({ summary: 'Get travels of current user' })
        @ApiResponse({ status: 200, description: 'Travels fetched successfully',type: TravelResponseDto })
        @ApiResponse({ status: 400, description: 'Bad request' })
        async getTravelOfUserCurrentUser(@CurrentUser() user: any){
        return await this.travelService.getTravelByUser(user.id)
        }
    
       //Admin gets demands by of any user
        @Get('/by-user/:id')
        @Roles(UserRole.ADMIN)//sets the required role to acces endpoint
        @UseGuards(JwtAuthGuard, RolesGuard) //guards the endpoint
        @ApiBearerAuth('JWT-auth') 
        @ApiOperation({ summary: 'Get travels of a user' })
        @ApiResponse({ status: 200, description: 'Travels fetched successfully',type: TravelResponseDto })
        @ApiResponse({ status: 400, description: 'Bad request' })
        async getTravelByUser(@Param('id', ParseIntPipe) id: number){
        return await this.travelService.getTravelByUser(id)
        }
    
       //Admin list all demands
        @Get('')
        @Roles(UserRole.ADMIN)//sets the required role to acces endpoint
        @UseGuards(JwtAuthGuard, RolesGuard) //guards the endpoint
        @ApiBearerAuth('JWT-auth') 
        @ApiOperation({ summary: 'Get all travels' })
        @ApiResponse({ status: 200, description: 'Travels fetched successfully',type: TravelResponseDto })
        @ApiResponse({ status: 400, description: 'Bad request' })
        async getAll(@Query() query: FindTravelsQueryDto){
        return await this.travelService.getAllTravels(query);
        }


        
    @Get('/by-airport/:airportId')
    @Roles(UserRole.ADMIN)//sets the required role to acces endpoint
    @UseGuards(JwtAuthGuard, RolesGuard) //guards the endpoint
    @ApiBearerAuth('JWT-auth') 
    @ApiOperation({ summary: 'Get travels by airport' })
    @ApiResponse({ status: 200, description: 'Travels fetched successfully',type: TravelResponseDto })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async getTravelsByDepartureAirport(@Param('airportId', ParseIntPipe) airportId: number){
    return await this.travelService.getTravelsByDepartureAirport(airportId)
    }

}
