import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { RequestService } from './request.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorattor';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateRequestToTravelDto } from './dto/createRequestToTravel.dto';
import { CreateRequestToDemandDto } from './dto/createRequestToDemand.dto';
import { UserEntity } from 'src/user/user.entity';
@Controller('request')
export class RequestController {

  constructor(private requestService: RequestService) { }


  // Update your existing POST endpoint to handle both DTOs
  @Post('to-travel')
  @UseGuards(JwtAuthGuard)
  async createRequestToTravel(@CurrentUser() user: any, @Body() createRequestDto: CreateRequestToTravelDto) {
    return this.requestService.createRequestToTravel(createRequestDto, user);
  }

  @Post('to-demand')
  @UseGuards(JwtAuthGuard)
  async createRequestToDemand(@CurrentUser() user: any, @Body() createRequestDto: CreateRequestToDemandDto) {
    return this.requestService.createRequestToDemand(createRequestDto, user);
  }

  //Get all Requests of a User
  @Get('/by-user/:id')
  @UseGuards(JwtAuthGuard)
  async getRequestsByUser(@Param('id', ParseIntPipe) id: number) {
    return this.requestService.getRequestsByUser(id);
  }


  //Get all Requests of the current user
  @Get('/me')
  @UseGuards(JwtAuthGuard)
  async getMyRequests(@CurrentUser() user: any) {
    return this.requestService.getRequestsByUser(user.id);
  }


  //Get a Request by ID
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getRequestById(@Param('id', ParseIntPipe) id: number) {
    return this.requestService.getRequestById(id);
  }


  // src/request/request.controller.ts

  @Patch(':id/accept')
  @UseGuards(JwtAuthGuard)
  async acceptRequest(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity
  ) {
    return this.requestService.acceptRequest(id, user);
  }
}
