import {
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

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/operators')
  getAllOperators() {
    return this.userService.getAllOperators();
  }

  @Get('/:idUser')
  getUserById(@Param('idUser', ParseIntPipe) idUser: number) {
    return this.userService.getUserById(idUser);
  }

  @Post('create-staff')
  @Roles(UserRole.ADMIN) //sets the required role to acces endpoint
  @UseGuards(JwtAuthGuard, RolesGuard) //guards the endpoint
  createStaff(@Body() createUserDto: CreateUserDto, @CurrentUser() user: any) {
    return this.userService.createUser(createUserDto, user);
  }

  @Post('update-staff')
  @Roles(UserRole.ADMIN) //sets the required role to acces endpoint
  @UseGuards(JwtAuthGuard, RolesGuard) //guards the endpoint
  updateStaff(
    @Param('idUser', ParseIntPipe) idUser: number,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: any,
  ) {
    return this.userService.updateStaff(idUser, updateUserDto, user);
  }

  @UseGuards(JwtAuthGuard) //user must be loggedin
  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return this.userService.getUserProfile(user);
  }

  @UseGuards(JwtAuthGuard) //user must be loggedin
  @Put('update-profile')
  updateProfile(@CurrentUser() user: any, updateUserDto: UpdateUserDto) {
    return this.userService.updateUserProfile(user, updateUserDto);
  }


  @UseGuards(JwtAuthGuard) //user must be loggedin
  @Put('update-phone')
  updatePhoneNumber(@CurrentUser() user: any, updatePhoneDto: UpdatePhoneDto) {
    return this.userService.updatePhoneNumber(user, updatePhoneDto);
  }
}
