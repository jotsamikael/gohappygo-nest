import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Post, Query, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { VerifyPhoneDto } from './dto/verifyPhone.dto';
import { FindUsersQueryDto } from './dto/FindUsersQuery.dto';
import { VerifyUserAccountDto } from './dto/verifyUserAccount.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles-guard';
import { Roles } from './decorators/role.decorators';
import { UserRole } from 'src/user/user.entity';
import { CurrentUser } from './decorators/current-user.decorattor';
import { UserEntity } from 'src/user/user.entity';
import { FileFieldsInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadFileDto } from 'src/file-upload/dto/upload-file.dto';
import { PaginatedResponse } from 'src/common/interfaces/paginated-reponse.interfaces';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiConsumes, ApiQuery } from '@nestjs/swagger';
import { RegisterResponseDto, LoginResponseDto, VerifyPhoneResponseDto, RefreshTokenResponseDto, UploadVerificationResponseDto, VerifyEmailResponseDto } from './dto/auth-response.dto';
import { UploadVerificationDto } from './dto/upload-verification.dto';
import { VerifyEmailDto } from './dto/verifyEmail.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ 
    status: 201, 
    description: 'User successfully registered',
    type: RegisterResponseDto
  })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 409, description: 'Conflict - user already exists' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email  with code' })
  @ApiBody({
    description: 'Verify email  with  code',
    type: VerifyPhoneDto,
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Email verified successfully',
    type: VerifyEmailResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid  code' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async verifyEmail(@Body() verifyEmailDto: VerifyEmailDto) {
    return this.authService.verifyEmail(verifyEmailDto);
  }

  @Post('verify-phone')
  @ApiOperation({ summary: 'Verify phone number with code' })
  @ApiBody({
    description: 'Verify phone number with  code',
    type: VerifyPhoneDto,
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Phone number verified successfully',
    type: VerifyPhoneResponseDto
  })
  @ApiResponse({ status: 400, description: 'Invalid activation code' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async verifyPhone(@Body() verifyPhoneDto: VerifyPhoneDto) {
    return this.authService.verifyPhone(verifyPhoneDto);
  }


  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    type: LoginResponseDto
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

 /* @Post('upload-verification')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload verification documents (ID, selfie)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Upload verification file',
    type: UploadFileDto,
  })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadFileForVerification(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadFileDto: UploadFileDto,
    @CurrentUser() user: UserEntity,
  ): Promise<any> {
    return this.authService.uploadVerificationDocuments(file, uploadFileDto, user);
  }*/


//validate the user account

@Post('upload-verification')
@UseGuards(JwtAuthGuard)
@UseInterceptors(
  FileFieldsInterceptor([
    { name: 'selfie', maxCount: 1 },
    { name: 'idFront', maxCount: 1 },
    { name: 'idBack', maxCount: 1 }
  ])
)
@ApiBearerAuth('JWT-auth')
@ApiOperation({ 
  summary: 'Upload verification documents',
  description: 'Upload selfie and both sides of national ID for identity verification'
})
@ApiConsumes('multipart/form-data')
@ApiBody({
  description: 'Upload verification files',
  schema: {
    type: 'object',
    properties: {
      selfie: {
        type: 'string',
        format: 'binary',
        description: 'Selfie photo of the user'
      },
      idFront: {
        type: 'string',
        format: 'binary',
        description: 'Front side of national ID'
      },
      idBack: {
        type: 'string',
        format: 'binary',
        description: 'Back side of national ID'
      },
      notes: {
        type: 'string',
        description: 'Additional notes for verification'
      }
    },
    required: ['selfie', 'idFront', 'idBack']
  }
})
@ApiResponse({ 
  status: 201, 
  description: 'Verification documents uploaded successfully',
  type: UploadVerificationResponseDto
})
@ApiResponse({ status: 400, description: 'Bad request - invalid files or missing files' })
@ApiResponse({ status: 401, description: 'Unauthorized' })
async uploadVerificationDocuments(
  @UploadedFiles() files: { 
    selfie?: Express.Multer.File[], 
    idFront?: Express.Multer.File[], 
    idBack?: Express.Multer.File[] 
  },
  @Body() uploadVerificationDto: UploadVerificationDto,
  @CurrentUser() user: UserEntity,
): Promise<UploadVerificationResponseDto> {
  const selfie = files.selfie?.[0];
  const idFront = files.idFront?.[0];
  const idBack = files.idBack?.[0];
  
  // Validate files in the controller
  if (!selfie) {
    throw new BadRequestException('Selfie file is required');
  }
  if (!idFront) {
    throw new BadRequestException('ID front file is required');
  }
  if (!idBack) {
    throw new BadRequestException('ID back file is required');
  }
  
  const fileArray = [selfie, idFront, idBack];
  return this.authService.uploadVerificationDocuments(fileArray, uploadVerificationDto, user);
}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user information' })
  @ApiResponse({ status: 200, description: 'Current user information' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getCurrentUser(@CurrentUser() user: UserEntity) {
    // Load the role relation to ensure it's available
    const userWithRole = await this.authService.getUserById(user.id);
    return {
      id: userWithRole.id,
      email: userWithRole.email,
      firstName: userWithRole.firstName,
      lastName: userWithRole.lastName,
      role: userWithRole.role,
      isPhoneVerified: userWithRole.isPhoneVerified,
      isVerified: userWithRole.isVerified
    };
  }



  @Post('verify-user/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Verify user account (Admin only)' })
  @ApiBody({
    description: 'Verify user account',
    type: VerifyUserAccountDto,
  })
  @ApiResponse({ status: 200, description: 'User verified successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Admin access required' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async verifyUserAccount(@Param('id', ParseIntPipe) idUser: number, @CurrentUser() admin: UserEntity,@Body() verifyUserAccountDto: VerifyUserAccountDto){
    return this.authService.verifyUserAccount(idUser, verifyUserAccountDto, admin);
  }

  

  @Post('refresh-token')
  @ApiOperation({ summary: 'Refresh access token' })
  
  @ApiResponse({ 
    status: 200, 
    description: 'Token refreshed successfully',
    type: RefreshTokenResponseDto
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }
}
