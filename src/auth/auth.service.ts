import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, MoreThan, Repository } from 'typeorm';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { UserEventsService } from 'src/events/user-events.service';
import { UserRoleEntity } from 'src/role/userRole.entity';
import { UserEntity, UserRole } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { RoleService } from 'src/role/role.service';
import { VerifyPhoneDto } from './dto/verifyPhone.dto';
import { UploadFileDto } from 'src/file-upload/dto/upload-file.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { VerifyUserAccountDto } from './dto/verifyUserAccount.dto';
import { UserVerificationAuditService } from 'src/user-verification-audit-entity/user-verification-audit.service';
import { PaginatedResponse } from '../common/interfaces/paginated-reponse.interfaces';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { FindUsersQueryDto } from './dto/FindUsersQuery.dto';
import { Cache } from 'cache-manager';
import { FilePurpose } from 'src/uploaded-file/uploaded-file-purpose.enum';
import { UploadVerificationResponseDto, UploadedFileResponseDto } from './dto/auth-response.dto';
import { UploadVerificationDto } from './dto/upload-verification.dto';
import { SmsService } from 'src/sms/sms.service';
import { EmailService } from 'src/email/email.service';
import { VerifyEmailDto } from './dto/verifyEmail.dto';
import { ResendVerificationDto, VerificationType } from './dto/resendVerification.dto';
import { EmailTemplatesService } from 'src/email/email-templates.service';
import { EmailVerificationService } from 'src/email-verification/email-verification.service';
import { PhoneVerificationService } from 'src/phone-verification/phone-verification.service';

@Injectable()
export class AuthService {
  private userListCacheKeys: Set<string> = new Set();

  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private jwtService: JwtService,
    private readonly userEventService: UserEventsService,
    private readonly roleService: RoleService,
    private userService: UserService,
    private fileUploadService: FileUploadService,
    private userAccountVerificationService: UserVerificationAuditService,
    private emailVerificationService: EmailVerificationService,
    private phoneVerificationService: PhoneVerificationService,
    private smsService: SmsService,
    private emailService: EmailService,
    private emailTemplatesService: EmailTemplatesService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    //bcrypt.hash('123456789',10).then(console.log) //this function allows you to generate the password for a user
  }

  async register(registerDto: RegisterDto) {
    //get the role of the role with code USER
    const userRole = await this.roleService.getUserRoleIdByCode('USER'); // secure default

    // Check for existing user by email or phone, including soft-deleted
    const existingEmailUser = await this.userService.findByField(
      'email',
      registerDto.email,
      true,
    );
    const existingPhoneUser = await this.userService.findByField(
      'phone',
      registerDto.phoneNumber,
      true,
    );

    // Check for soft-deleted email match → restore
    if (existingEmailUser?.deletedAt) {
      await this.userService.restoreUserAccount(existingEmailUser.id);
      // Optionally reset password, send welcome-back email, etc.
      return {
        user: existingEmailUser,
        message: 'Welcome back! Your account has been restored.',
      };
    }

    // Check for soft-deleted phone match → restore
    if (existingPhoneUser?.deletedAt) {
      await this.userService.restoreUserAccount(existingPhoneUser.id);
      return {
        user: existingPhoneUser,
        message: 'Welcome back! Your account has been restored.',
      };
    }

    // If either already exists and is NOT deleted → reject registration
    if (existingEmailUser || existingPhoneUser) {
      throw new ConflictException(
        'Email or phone number is already in use. Please try a different one.',
      );
    }

    const hashedPassword = await this.hashPassword(registerDto.password);
    const newlyCreatedUser = this.usersRepository.create({
      email: registerDto.email,
      firstName: registerDto.firstName,
      lastName: registerDto.lastName,
      phone: registerDto.phoneNumber,
      password: hashedPassword,
      roleId: userRole?.id,
      isEmailVerified: false,
      isPhoneVerified: false,
      isVerified: false,
    });

    const saveUser = await this.usersRepository.save(newlyCreatedUser);

    // Generate verification codes
    const emailVerificationCode = this.generate6DigitCode();
    const phoneVerificationCode = this.generate6DigitCode();

    // Record verification codes
    await this.emailVerificationService.recordEmailVerification(saveUser, emailVerificationCode.toString());
    await this.phoneVerificationService.recordPhoneVerification(saveUser, phoneVerificationCode.toString());

    // Send verification emails and SMS
    await this.sendEmailVerification(saveUser, emailVerificationCode.toString());
    await this.sendPhoneVerification(saveUser, phoneVerificationCode.toString());

    const { password, ...result } = saveUser;
    this.userEventService.emitUserRegistered(saveUser);

    return {
      user: result,
      message: 'Registration successful. Please verify your email and phone number to continue.',
    };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const user = await this.userService.findByField('email', verifyEmailDto.email);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const latestVerification = await this.emailVerificationService.getLatestValidEmailVerificationCode(user);
    
    if (!latestVerification) {
      throw new BadRequestException('No valid email verification code found');
    }

    if (latestVerification.code !== verifyEmailDto.verificationCode) {
      throw new BadRequestException('Invalid email verification code');
    }

    // Mark email as verified
    user.isEmailVerified = true;
    await this.userService.save(user);

    // Mark verification code as used
    await this.emailVerificationService.setValidatedDate(latestVerification);

    // Send welcome email
    await this.emailService.sendWelcomeEmail(user.email, user.firstName);

    //emit email verified event
    //this.userEventService.emitEmailVerified(user, verifyEmailDto.email);

    return {
      message: 'Email verified successfully',
    };
  }

  async verifyPhone(verifyPhoneDto: VerifyPhoneDto) {
    const user = await this.userService.getUserByPhone(verifyPhoneDto.phoneNumber);
    if(!user){
      throw new NotFoundException('User not found');
    }
    
    const latestVerification = await this.phoneVerificationService.getLatestValidPhoneVerificationCode(user);
    
    if (!latestVerification) {
      throw new BadRequestException('No valid phone verification code found');
    }

    if (latestVerification.code !== verifyPhoneDto.verificationCode) {
      throw new BadRequestException('Invalid phone verification code');
    }

    // Mark phone as verified
    user.isPhoneVerified = true;
    await this.userService.save(user);

    // Mark verification code as used
    await this.phoneVerificationService.setValidatedDate(latestVerification);

    // Send welcome SMS
    await this.smsService.sendWelcomeMessage(user.phone, user.firstName);

    this.userEventService.emitPhoneVerified(user, verifyPhoneDto.phoneNumber);

    return {
      message: 'Phone number verified successfully',
    };
  }

  async resendVerification(resendVerificationDto: ResendVerificationDto) {
    const user = await this.userService.findByField('email', resendVerificationDto.email);
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (resendVerificationDto.type === VerificationType.EMAIL) {
      if (user.isEmailVerified) {
        throw new BadRequestException('Email is already verified');
      }

      const emailVerificationCode = this.generate6DigitCode();
      await this.emailVerificationService.recordEmailVerification(user, emailVerificationCode.toString());
      await this.sendEmailVerification(user, emailVerificationCode.toString());

      return {
        message: 'Email verification code sent successfully',
      };
    } else if (resendVerificationDto.type === VerificationType.PHONE) {
      if (user.isPhoneVerified) {
        throw new BadRequestException('Phone number is already verified');
      }

      const phoneVerificationCode = this.generate6DigitCode();
      await this.phoneVerificationService.recordPhoneVerification(user, phoneVerificationCode.toString());
      await this.sendPhoneVerification(user, phoneVerificationCode.toString());

      return {
        message: 'Phone verification code sent successfully',
      };
    }

    throw new BadRequestException('Invalid verification type');
  }

 

  /*async uploadVerificationDocuments(
    file,
    uploadFileDto: UploadFileDto,
    user: UserEntity,
  ): Promise<any> {
    return this.fileUploadService.uploadFile(file, uploadFileDto.purpose, user);
  }*/

    
// Update the uploadVerificationDocuments method:
// In src/auth/auth.service.ts

async uploadVerificationDocuments(
  files: Express.Multer.File[],
  uploadVerificationDto: UploadVerificationDto, // Now only contains notes
  user: UserEntity,
): Promise<UploadVerificationResponseDto> {
  // Validate number of files
  if (!files || files.length !== 3) {
    throw new BadRequestException('Exactly 3 files are required: selfie, ID front, and ID back');
  }

  // Validate file types and sizes
  const maxFileSize = 5 * 1024 * 1024; // 5MB
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  for (const file of files) {
    // Check file size
    if (file.size > maxFileSize) {
      throw new BadRequestException(`File ${file.originalname} is too large. Maximum size is 5MB`);
    }

    // Check file type
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`File ${file.originalname} is not a valid image. Allowed types: JPEG, PNG, WebP`);
    }
  }

  const [selfie, idFront, idBack] = files;
  
  try {
    // Upload selfie
    const selfieFile = await this.fileUploadService.uploadFile(
      selfie, 
      FilePurpose.SELFIE, 
      user
    );

    // Upload ID front
    const idFrontFile = await this.fileUploadService.uploadFile(
      idFront, 
      FilePurpose.ID_FRONT, 
      user
    );

    // Upload ID back
    const idBackFile = await this.fileUploadService.uploadFile(
      idBack, 
      FilePurpose.ID_BACK, 
      user
    );

    const response: UploadVerificationResponseDto = {
      message: 'Verification documents uploaded successfully',
      files: [
        this.mapToUploadedFileResponse(selfieFile),
        this.mapToUploadedFileResponse(idFrontFile),
        this.mapToUploadedFileResponse(idBackFile)
      ]
    };

    //emit user verification documents uploaded event
    this.userEventService.emitVerificationDocumentsUploaded(user, ['ID_FRONT', 'ID_BACK', 'SELFIE'], 3, uploadVerificationDto.notes);

    return response;
  } catch (error) {
    throw new BadRequestException(`Failed to upload files: ${error.message}`);
  }
}

// Helper method to map file entities to response DTOs
private mapToUploadedFileResponse(fileEntity: any): UploadedFileResponseDto {
  return {
    id: fileEntity.id,
    originalName: fileEntity.originalName,
    url: fileEntity.url,
    purpose: fileEntity.purpose,
    uploadedAt: fileEntity.uploadedAt || fileEntity.createdAt
  };
}



 

  async verifyUserAccount(
    idUser: number,
    verifyUserAccountDto: VerifyUserAccountDto,
    admin: UserEntity,
  ) {
    //get user account by id or throw exception
    const user = await this.usersRepository.findOne({
      where: { id: idUser },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${idUser} not found`);
    }
    //update user account based on verifyUserAccountDto (rejected/approved)
    user.isVerified = verifyUserAccountDto.approved;

    await this.userService.save(user);

    //emit user verification status changed event
    this.userEventService.emitVerificationStatusChanged(user, verifyUserAccountDto.approved ? 'approved' : 'rejected', verifyUserAccountDto.reason, admin);

    //record account verification
    await this.userAccountVerificationService.record(
      verifyUserAccountDto.approved,
      verifyUserAccountDto.reason,
      user,
      admin,
    );
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
      relations: ['role'],
    });
   console.log(user);
    if (
      !user)
     {
      throw new UnauthorizedException(
        'Invalid credentials or account not exists',
      );
    }
    //check password
    const isPasswordValid = await this.verifyPassword(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials or account not exists');
    }

    //generate
    const tokens = this.generateToken(user);
    const { password, ...result } = user;
    return {
      user: result,
      ...tokens,
    };
  }

  generateToken(user: UserEntity) {
    return {
      access_token: this.generateAccessToken(user),
      refresh_token: this.generateRefreshToken(user),
    };
  }

  generateAccessToken(user: UserEntity): string {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role.code,
      type: 'access' // Add token type for clarity
    };
    return this.jwtService.sign(payload, {
      secret: 'jwt_secret',
      expiresIn: '1440m',//1 day
    });
  }

  // Find current user by ID
  async getUserById(userId: number) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['role'],
    });
    if (!user) {
      throw new UnauthorizedException('User not found!');
    }
    const { password, ...result } = user;
    return result;
  }

  async refreshToken(refreshToken: string) {
    try {
      // Verify the refresh token
      const payload = this.jwtService.verify(refreshToken, {
        secret: 'refresh_secret',
      });

      // Check if it's actually a refresh token
      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Get user with role
      const user = await this.usersRepository.findOne({
        where: { id: payload.sub },
        relations: ['role'],
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      // Generate new access token
      const newAccessToken = this.generateAccessToken(user);
      
      return { 
        accessToken: newAccessToken,
        message: 'Token refreshed successfully'
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Refresh token expired');
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  generateRefreshToken(user: UserEntity): string {
    const payload = {
      email: user.email,
      sub: user.id,
      type: 'refresh' // Add token type for clarity
    };
    return this.jwtService.sign(payload, {
      secret: 'refresh_secret', // Use different secret
      expiresIn: '7d',
    });
  }
  private async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  private async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  private generate5DigitCode(): number {
    return Math.floor(10000 + Math.random() * 90000);
  }

  private async sendEmailVerification(user: UserEntity, code: string) {
    const emailTemplate = this.emailTemplatesService.getEmailVerificationTemplate(user.firstName, code);
    await this.emailService.sendEmail({
      to: user.email,
      subject: 'Email Verification - GoHappyGo',
      html: emailTemplate
    });
  }

  private async sendPhoneVerification(user: UserEntity, code: string) {
    await this.smsService.sendVerificationCode(user.phone, code);
  }

  private generate6DigitCode(): number {
    return Math.floor(100000 + Math.random() * 900000);
  }
}
