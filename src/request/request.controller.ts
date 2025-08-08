import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { RequestService } from './request.service';
import { CurrentUser } from 'src/auth/decorators/current-user.decorattor';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateRequestToTravelDto } from './dto/createRequestToTravel.dto';
import { CreateRequestToDemandDto } from './dto/createRequestToDemand.dto';
import { UserEntity, UserRole } from 'src/user/user.entity';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateRequestResponseDto, RequestResponseDto } from './dto/request-reponse.dto';
import { Roles } from 'src/auth/decorators/role.decorators';
import { RolesGuard } from 'src/auth/guards/roles-guard';

@ApiTags('requests')
@Controller('request')
export class RequestController {

  constructor(private requestService: RequestService) { }


  // Update your existing POST endpoint to handle both DTOs
  @Post('to-travel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth') 
  @ApiOperation({ summary: 'Create a request to travel' })
  @ApiBody({ type: CreateRequestToTravelDto })
  @ApiResponse({ status: 201, description: 'Request to travel created successfully',type: CreateRequestResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createRequestToTravel(@CurrentUser() user: any, @Body() createRequestDto: CreateRequestToTravelDto) {
    return this.requestService.createRequestToTravel(createRequestDto, user);
  }

  @Post('to-demand')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth') 
  @ApiOperation({ summary: 'Create a request to demand' })
  @ApiResponse({ status: 201, description: 'Request to demand created successfully',type: CreateRequestResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createRequestToDemand(@CurrentUser() user: any, @Body() createRequestDto: CreateRequestToDemandDto) {
    return this.requestService.createRequestToDemand(createRequestDto, user);
  }

  //Get all Requests of a User
  @Get('/by-user/:id')
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth') 
  @ApiOperation({ summary: 'Get all requests of a user' })
  @ApiResponse({ status: 200, description: 'Requests fetched successfully',type: RequestResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async getRequestsByUser(@Param('id', ParseIntPipe) id: number) {
    return this.requestService.getRequestsByUser(id);
  }


  //Get all Requests of the current user
  @Get('/me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth') 
  @ApiOperation({ summary: 'Get all requests of the current user' })
  @ApiResponse({ status: 200, description: 'Requests fetched successfully',type: RequestResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async getMyRequests(@CurrentUser() user: any) {
    return this.requestService.getRequestsByUser(user.id);
  }


  //Get a Request by ID
  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get a request by id' })
  @ApiResponse({ status: 200, description: 'Request fetched successfully',type: RequestResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async getRequestById(@Param('id', ParseIntPipe) id: number) {
    return this.requestService.getRequestById(id);
  }


  // src/request/request.controller.ts

  @Patch(':id/accept')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth') 
  @ApiOperation({ summary: 'Accept a request' })
  @ApiResponse({ status: 200, description: 'Request accepted successfully',type: RequestResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async acceptRequest(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserEntity
  ) {
    return this.requestService.acceptRequest(id, user);
  }
}
