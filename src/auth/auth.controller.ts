import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorattor';
import { Roles } from './decorators/role.decorators';
import { UserEntity, UserRole } from '../user/user.entity';
import { RolesGuard } from './guards/roles-guard';
import { LoginThrottlerGuard } from './guards/login-throttler.guard';
import { VerifyPhoneDto } from './dto/verifyPhone.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadFileDto } from 'src/file-upload/dto/upload-file.dto';
import { VerifyUserAccountDto } from './dto/verifyUserAccount.dto';
import { PaginatedResponse } from 'src/common/interfaces/paginated-reponse.interfaces';
import { FindUserQueryDto } from './dto/FindUserQuery.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

   @Post('verify-phone')
   verifyPhone(@Body() verifyPhoneDto: VerifyPhoneDto) {
    return this.authService.verifyPhoneNumber(verifyPhoneDto);
  }


    @Post('upload-verification')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFileForVerification(
      @UploadedFile() file: Express.Multer.File,
      @Body() uploadFileDto: UploadFileDto,
      @CurrentUser() user: UserEntity,
    ): Promise<any> {
      if (!file) {
        throw new BadRequestException('File is required');
      }
  
      return this.authService.uploadVerificationDocuments(file,uploadFileDto,user);
    }

    //Admin list unverified user accounts
    @Get('/unverified')
    @Roles(UserRole.ADMIN)//sets the required role to acces endpoint
    @UseGuards(JwtAuthGuard, RolesGuard) //guards the endpoint
    async unVerifiedUserAccounts(@Query() query :FindUserQueryDto): Promise<PaginatedResponse<Partial<UserEntity>>>{
      return this.authService.getUnVerifiedUser(query);
    }

    //Admin verify user account
    @Patch('verify/:id')
    @Roles(UserRole.ADMIN)//sets the required role to acces endpoint
    @UseGuards(JwtAuthGuard, RolesGuard) //guards the endpoint
    async verifyUserAccount(@Param('id', ParseIntPipe) idUser: number, @CurrentUser() admin: UserEntity,@Body() verifyUserAccountDto: VerifyUserAccountDto){
     return this.authService.verifyUserAccount(idUser, verifyUserAccountDto, admin)
    }



  @UseGuards(LoginThrottlerGuard)
  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  
}
