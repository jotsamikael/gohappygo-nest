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
import { UserActivationService } from 'src/user-activation/user-activation.service';
import { RoleService } from 'src/role/role.service';
import { VerifyPhoneDto } from './dto/verifyPhone.dto';
import { UploadFileDto } from 'src/file-upload/dto/upload-file.dto';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { VerifyUserAccountDto } from './dto/verifyUserAccount.dto';
import { UserVerificationAuditService } from 'src/user-verification-audit-entity/user-verification-audit.service';
import { PaginatedResponse } from '../common/interfaces/paginated-reponse.interfaces';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { FindUserQueryDto } from './dto/FindUserQuery.dto';
import { Cache } from 'cache-manager';

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
    private userActivationService: UserActivationService,
    private userAccountVerificationService: UserVerificationAuditService,
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
      password: hashedPassword,
      roleId: userRole?.id,
    });

    const saveUser = await this.usersRepository.save(newlyCreatedUser);

    //generate 5 digit code
    const activationCode = this.generate5DigitCode();
    console.log(`activation Code is : ${activationCode}`);

    //save activation record
    const activationRecord =
      await this.userActivationService.recordUserActivation(
        saveUser,
        activationCode,
      );

    //throw exception if recording of activation fails
    if (!activationRecord) {
      throw new NotFoundException(`activation record was not found`);
    }

    //after saving to db, emit the user registered event, and send activation code by sms
    this.userEventService.emitUserRegistered(newlyCreatedUser);

    const { password, ...result } = saveUser;
    return {
      user: result,
      message: 'Register successful, You can now verify your account',
    };
  }

  async verifyPhoneNumber(verifyPhoneDto: VerifyPhoneDto) {
    //Get user account
    const user = await this.userService.getUserByPhone(
      verifyPhoneDto.phoneNumber,
    );

    // Get the latest valid activation code
    const latestActivation =
      await this.userActivationService.getLatestValidActivationCode(user!);

    //if there's no activation code throw exception
    if (!latestActivation) {
      throw new BadRequestException('No valid activation code found');
    }
    //if different throw exception
    if (latestActivation.code !== verifyPhoneDto.activationCode) {
      throw new BadRequestException('The activation code submitted is invalid');
    }
    //if same, update user account to phone verified
    await this.userService.setToUserPhoneVerified(user!);

    //then update useractivation record by updating validated at
    await this.userActivationService.setValidatedDate(latestActivation);

    return {
      message: 'Phone number verified successfully',
    };
  }

  async uploadVerificationDocuments(
    file,
    uploadFileDto: UploadFileDto,
    user: UserEntity,
  ): Promise<any> {
    return this.fileUploadService.uploadFile(file, uploadFileDto.purpose, user);
  }

  private generateUserListCacheKey(query: FindUserQueryDto): string {
    const { page = 1, limit = 10, email } = query;
    return `user_list_page${page}_limit${limit}_email${email || 'all'}`;
  }

  async getUnVerifiedUser(
    query: FindUserQueryDto,
  ): Promise<PaginatedResponse<Partial<UserEntity>>> {
    //generate cache key
    const cacheKey = this.generateUserListCacheKey(query);
    //add cache key to memory
    this.userListCacheKeys.add(cacheKey);

    //get data from cache
    const getCachedData =
      await this.cacheManager.get<PaginatedResponse<UserEntity>>(cacheKey);
    if (getCachedData) {
      console.log(
        `Cache Hit---------> Returning users list from Cache ${cacheKey}`,
      );
      return getCachedData;
    }
    console.log(`Cache Miss---------> Returning users list from database`);
    const { page = 1, limit = 10, email } = query;
    const skip = (page - 1) * limit;

    //get only unverified users whose role is USER
    const queryBuilder = this.usersRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role') // join to access role.code
      .where('user.isVerified = :isVerified', { isVerified: false })
      .andWhere('role.code = :roleCode', { roleCode: 'USER' })
      .orderBy('user.created_at', 'DESC')
      .skip(skip)
      .take(limit);

    if (email) {
      queryBuilder.andWhere('user.email ILIKE :email', { email: `%${email}%` });
    }

    const [rawItems, totalItems] = await queryBuilder.getManyAndCount();
    // Remove password from each user
    const items = rawItems.map(({ password, ...rest }) => rest);

    const totalPages = Math.ceil(totalItems / limit);

    const responseResult = {
      items,
      meta: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages,
      },
    };
    await this.cacheManager.set(cacheKey, responseResult, 30000);
    return responseResult;
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

    //send email with reject reason if any

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
    });
    if (
      !user ||
      !(await this.verifyPassword(loginDto.password, user.password))
    ) {
      throw new UnauthorizedException(
        'Invalid credentials or account not exists',
      );
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
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
  }

  generateAccessToken(user: UserEntity): string {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role.code,
    };
    return this.jwtService.sign(payload, {
      secret: 'jwt_secret',
      expiresIn: '15m',
    });
  }

  // Find current user by ID
  async getUserById(userId: number) {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException('User not found!');
    }
    const { password, ...result } = user;
    return result;
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: 'refresh_secret',
      });
      const user = await this.usersRepository.findOne({
        where: { id: payload.sub },
      });
      if (!user) {
        throw new UnauthorizedException('Invalid token');
      }
      const accessToken = this.generateAccessToken(user);
      return { accessToken };
    } catch (e) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  generateRefreshToken(user: UserEntity): string {
    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role.code,
    };
    return this.jwtService.sign(payload, {
      secret: 'jwt_secret',
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
}
