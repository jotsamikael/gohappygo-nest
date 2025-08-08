import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/createUser.dto';
import { Roles } from 'src/auth/decorators/role.decorators';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles-guard';
import { UserRole } from './user.entity';
import { CurrentUser } from 'src/auth/decorators/current-user.decorattor';
import { UpdateUserDto } from './dto/updateUser.dto';
import { UpdatePhoneDto } from './dto/UpdatePhone.dto';
import { ApiTags, ApiBody, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { UserResponseDto } from './dto/user-response.dto';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';

@ApiTags('users')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get('/operators')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get all operators',
    description: 'Retrieve all operator accounts. Admin access required.'
  })
  @ApiResponse({
    status: 200,
    description: 'Operators fetched successfully',
    type: [UserResponseDto] // Array of users
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  getAllOperators() {
    return this.userService.getAllOperators();
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

  @Post('update-staff/:idUser')
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
}
