import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { DemandService } from './demand.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorattor';
import { CreateDemandDto } from './dto/createDemand.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { Roles } from 'src/auth/decorators/role.decorators';
import { RolesGuard } from 'src/auth/guards/roles-guard';
import { UserRole } from 'src/user/user.entity';
import { FindDemandsQueryDto } from './dto/FindDemandsQuery.dto';

@Controller('demand')
export class DemandController {

    constructor(private readonly demandService: DemandService){}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(JwtAuthGuard) //must be connected
    async publishDemand(@CurrentUser() user: any, @Body() createDemandDto:CreateDemandDto){
    return await this.demandService.publishDemand(user, createDemandDto)
    }

    //get demands of currently logged-in user
    @Get('/current-user')
    @UseGuards(JwtAuthGuard) //must be connected
    async getDemandOfUserCurrentUser(@CurrentUser() user: any){
    return await this.demandService.getDemandByUser(user.id)
    }

   //Admin gets demands by of any user
    @Get('/by-user/:id')
    @Roles(UserRole.ADMIN)//sets the required role to acces endpoint
    @UseGuards(JwtAuthGuard, RolesGuard) //guards the endpoint
    async getDemandByUser(@Param('id', ParseIntPipe) id: number){
    return await this.demandService.getDemandByUser(id)
    }

   //Admin list all demands
    @Get('')
    @Roles(UserRole.ADMIN)//sets the required role to acces endpoint
    @UseGuards(JwtAuthGuard, RolesGuard) //guards the endpoint
    async getAll(@Query() query: FindDemandsQueryDto){
    return await this.demandService.getAllDemands(query);
    }


    // gets demands by of flight number user
    @Get('/by-flight-number/:flight')
    @UseGuards(JwtAuthGuard) //must be connected
    async getDemandByFlightNumber(@Param('flight') flight: string){
    return await this.demandService.getDemandByFlightNumber(flight)
    }


    @Get('/by-airport/:airportId')
    @Roles(UserRole.ADMIN)//sets the required role to acces endpoint
    @UseGuards(JwtAuthGuard, RolesGuard) //guards the endpoint
    async getDemandsByAirport(@Param('airportId', ParseIntPipe) airportId: number){
    return await this.demandService.getDemandsByAirport(airportId)
    }
}
