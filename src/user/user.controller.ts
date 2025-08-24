import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/request/createUser.dto';
import { Roles } from 'src/auth/decorators/role.decorators';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles-guard';
import { UserEntity, UserRole } from './user.entity';
import { CurrentUser } from 'src/auth/decorators/current-user.decorattor';
import { UpdateUserDto } from './dto/request/updateUser.dto';
import { UpdatePhoneDto } from './dto/request/UpdatePhone.dto';
import { ApiTags, ApiBody, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { PaginatedUserResponseDto, UserResponseDto } from './dto/user-response.dto';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';
import { FindUsersQueryDto } from 'src/auth/dto/FindUsersQuery.dto';
import { ToggleActivationDto } from './dto/toggle-activation.dto';

@ApiTags('users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }



   // Single GET endpoint that handles all filtering scenarios

  @Get('')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN || UserRole.OPERATOR)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all users',
    description: 'Retrieve all user accounts. Admin can access all users (OPERATOR and USER), operator can only access USERs.'
  })
  @ApiResponse({
    status: 200,
    description: 'Operators fetched successfully',
    type: [PaginatedUserResponseDto] // Array of users
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin or operator access required' })
  getAllOperators(@Query() query: FindUsersQueryDto,@CurrentUser() user: any) {
    return this.userService.getAllUsers(query);
  }

  

  @Post('create-staff')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create staff member',
    description: 'Create a new staff member account. Admin access required.'
  })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'Staff member created successfully',
    type: UserResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  createStaff(@Body() createUserDto: CreateUserDto, @CurrentUser() user: any) {
    return this.userService.createUser(createUserDto, user);
  }

  @Put('update-staff/:idUser')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update staff member',
    description: 'Update an existing staff member account. Admin access required.'
  })
  @ApiParam({
    name: 'idUser',
    description: 'Staff member ID to update',
    type: 'number',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Staff member updated successfully',
    type: UserResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Staff member not found' })
  updateStaff(
    @Param('idUser', ParseIntPipe) idUser: number,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: any,
  ) {
    return this.userService.updateStaff(idUser, updateUserDto, user);
  }

  // Add this endpoint to the UserController class
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieve the comprehensive profile of the currently authenticated user with all relations and counts'
  })
  @ApiResponse({
    status: 200,
    description: 'Profile fetched successfully',
    type: UserProfileResponseDto
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'User profile not found' })

  async getProfile(@CurrentUser() user: any) {
    // Extract user ID from the JWT user object
    const userId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id;

    if (isNaN(userId)) {
      throw new BadRequestException('Invalid user ID');
    }

    return this.userService.getFullUserProfile(userId);
  }

  @Put('update-profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update current user profile',
    description: 'Update the profile of the currently authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'Profile updated successfully',
    type: UserResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateProfile(@CurrentUser() user: any, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.updateUserProfile(user, updateUserDto);
  }

  @Put('update-phone')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiBody({ type: UpdatePhoneDto })
  @ApiOperation({
    summary: 'Update phone number',
    description: 'Update the phone number of the currently authenticated user'
  })
  @ApiResponse({
    status: 200,
    description: 'Phone number updated successfully',
    type: UserResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updatePhoneNumber(@CurrentUser() user: any, @Body() updatePhoneDto: UpdatePhoneDto) {
    return this.userService.updatePhoneNumber(user, updatePhoneDto);
  }

  @Patch(':id/toggle-activation')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiBody({ type: ToggleActivationDto })
  @ApiOperation({
    summary: 'Toggle staff member activation status',
    description: 'Toggle the activation status of an existing staff member account. Admin access required.'
  })
  @ApiParam({
    name: 'id',
    description: 'Staff member ID to toggle activation status',
    type: 'number',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Staff member activation status toggled successfully',
    type: UserResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Staff member not found' })
  async toggleStaffActivation(
    @Param('id', ParseIntPipe) id: number,
    @Body() toggleActivationDto: ToggleActivationDto,
    @CurrentUser() user: UserEntity
  ): Promise<UserResponseDto> {
    return await this.userService.toggleStaffActivation(
      id, 
      toggleActivationDto.isDeactivated, 
      user
    );
  }

  @Delete('delete-staff/:id')
  @Roles(UserRole.ADMIN)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Delete staff member',
    description: 'Delete an existing staff member account. Admin access required.'
  })
  @ApiParam({
    name: 'id',
    description: 'Staff member ID to delete',
    type: 'number',
    example: 1
  })
  @ApiResponse({
    status: 200,
    description: 'Staff member deleted successfully',
    type: UserResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'Staff member not found' })
  deleteStaff(@Param('id', ParseIntPipe) id: number) {
    return this.userService.deleteStaff(id);
  }

  
}



