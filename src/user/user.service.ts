import { BadRequestException, ConflictException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { FindOptionsWhere, Repository, UpdateResult } from 'typeorm';
import { CreateUserDto } from './dto/createUser.dto';
import { RoleService } from 'src/role/role.service';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/updateUser.dto';
import { ChangePasswordDto } from './dto/changePassword.dto';
import { UpdatePhoneDto } from './dto/UpdatePhone.dto';

@Injectable()
export class UserService implements OnModuleInit {
   
  //injecting service from another module
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private roleService: RoleService,
  ) {}

  async onModuleInit() {
    await this.seedAdminUser();
    await this.seedOperatorUser();
  }

  

  async findByField(
    field: string,
    value: string,
    includeDeleted = true,
  ): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: {
        [field]: value,
      },
      relations: ['role'],
      withDeleted: includeDeleted,
    });
  }

  async getAllOperators(): Promise<UserEntity[] | null> {
    const operatorRole =  await this.roleService.getUserRoleIdByCode('OPERATOR');
    return this.userRepository.findBy({roleId:operatorRole?.id});
  }


   async getUserByPhone(phone: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findOne({ where:{phone}, relations: ['role'] });
    if (!user) {
      throw new NotFoundException(`User with phone ${phone} not found`);
    }
    return user;
  }

  async getUserByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findOne({ where: { email }, relations: ['role'] });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async getUserById(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({ where: { id }, relations: ['role'] });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} was not found`);
    }
    return user;
  }

  async createUser(createUserDto: CreateUserDto, user:UserEntity) {
    const role = await this.roleService.getUserRoleIdByCode('USER');

    const hashedPassword = await this.hashPassword('123456');

    const newUser = this.userRepository.create({
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      email: createUserDto.email,
      phone: createUserDto.phoneNumber,
      roleId: role?.id,
      password: hashedPassword,
      createdBy: user.id
    });
    const saveUser = await this.userRepository.save(newUser);
    const { password, ...result } = saveUser;
    return {
      user: result,
      message: 'Admin created successfully, login to continue',
    };
  }

 async updateStaff(
  id: number,
  updateUserDto: UpdateUserDto,
  user: UserEntity
): Promise<UserEntity> {
  const currentUser = await this.getUserById(id);

  //Check uniqueness if email is changing
  if (
    updateUserDto.email &&
    updateUserDto.email !== currentUser.email
  ) {
    const emailExists = await this.userRepository.findOne({
      where: { email: updateUserDto.email },
    });
    if (emailExists) {
      throw new ConflictException('Email already in use');
    }
    currentUser.email = updateUserDto.email;
  }

  if (
    updateUserDto.phoneNumber &&
    updateUserDto.phoneNumber !== currentUser.phone
  ) {
    const phoneExists = await this.userRepository.findOne({
      where: { phone: updateUserDto.phoneNumber },
    });
    if (phoneExists) {
      throw new ConflictException('Phone number already in use');
    }
    currentUser.phone = updateUserDto.phoneNumber;
  }

  if (updateUserDto.firstName) {
    currentUser.firstName = updateUserDto.firstName;
  }

  if (updateUserDto.lastName) {
    currentUser.lastName = updateUserDto.lastName;
  }

  // update role
  if (typeof updateUserDto.roleId === 'number') {
    currentUser.roleId = updateUserDto.roleId;
    currentUser.role = await this.roleService.getUserRoleById(updateUserDto.roleId);
  }


  currentUser.updatedBy = user.id;
  const updatedUser = await this.userRepository.save(currentUser);

  // Optionally emit updated event
  // this.userEventService.emitUserUpdated(updatedUser);

  return updatedUser;
}


async setToUserPhoneVerified(user: UserEntity) {
    user.isPhoneVerified = true;
  await this.userRepository.save(user);

  }

  async updatePassword(id: number, changePasswordDto: ChangePasswordDto){
    //get current user
       const currentUser = await this.getUserById(id);
       //if current password of user matches dto password
       if(!await this.verifyPassword(changePasswordDto.currentPassword, currentUser.password)){
        throw new BadRequestException(`Password ${changePasswordDto.currentPassword} does not match existing password`)
       }
        //hash newly defined user password
         const hashedNewPassword = await this.hashPassword(changePasswordDto.newPassword);
         currentUser.password = hashedNewPassword;
         await this.userRepository.save(currentUser);
    
      return {
      user: currentUser,
      message: 'Password updated successfully',
      }
  }

async restoreUserAccount(id: number): Promise<UpdateResult> {
    const user = await this.userRepository.restore(id);
    return user;
  }

// Add this method to src/user/user.service.ts after the existing getUserProfile method

/**
 * Get comprehensive user profile with all relations and counts
 * This method returns the full user profile with all related data
 */
async getFullUserProfile(userId: number): Promise<any> {
  try {
    // Get user with all relations
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: [
        'role',
        'demands',
        'travels',
        'messagesSend',
        'messagesReceived',
        'files',
        'requests',
        'activations',
        'verificationLogs',
        'verificationActions',
      ],
    });

    if (!user) {
      throw new NotFoundException(`User profile not found`);
    }

    // Remove password from response
    const { password, ...userWithoutPassword } = user;

    // Add counts for better UX
    const profileWithCounts = {
      ...userWithoutPassword,
      demandsCount: user.demands?.length || 0,
      travelsCount: user.travels?.length || 0,
      messagesSentCount: user.messagesSend?.length || 0,
      messagesReceivedCount: user.messagesReceived?.length || 0,
      requestsCount: user.requests?.length || 0,
      filesCount: user.files?.length || 0,
    };

    return profileWithCounts;
  } catch (error) {
    if (error instanceof NotFoundException) {
      throw error;
    }
    throw new NotFoundException(`Failed to fetch user profile: ${error.message}`);
  }
}


async updateUserProfile(user: any, updateUserDto: UpdateUserDto) {
     
    const currentUser = await this.getUserById(user.id);

  //Check uniqueness if email is changing
  if (
    updateUserDto.email &&
    updateUserDto.email !== currentUser.email
  ) {
    const emailExists = await this.userRepository.findOne({
      where: { email: updateUserDto.email },
    });
    if (emailExists) {
      throw new ConflictException('Email already in use');
    }
    currentUser.email = updateUserDto.email;
  }


  if (updateUserDto.firstName) {
    currentUser.firstName = updateUserDto.firstName;
  }

  if (updateUserDto.lastName) {
    currentUser.lastName = updateUserDto.lastName;
  }

  currentUser.updatedBy = user.id;
  const updatedUser = await this.userRepository.save(currentUser);

  // TODO emit updated event..  
  // this.userEventService.emitUserUpdated(updatedUser);

  return updatedUser;
    }


async updatePhoneNumber(user: UserEntity, updatePhoneDto: UpdatePhoneDto) {

        //get user
        const foundUser = await this.getUserById(user.id)
        console.log(foundUser)

        if(!foundUser){
          throw new NotFoundException(`User not found`)

        }
        //if old and new phone number are the save, cancel
       if( updatePhoneDto.newPhoneNumber ==  updatePhoneDto.oldPhoneNumber){
        throw new BadRequestException(`Old phone number and new can not be the same`)
       }
       //
       foundUser.phone = updatePhoneDto.newPhoneNumber; //update phone number
       foundUser.isPhoneVerified = false; //set is phone verified to false 
       await this.userRepository.save(foundUser);

       //TODO emit phone number changed event

       return {
      user: foundUser,
      message: 'PhoneNumber updated successfully',
      }

    }



 async save(user: UserEntity) {
    await this.userRepository.save(user);
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


  async findOne(arg: FindOptionsWhere<UserEntity>): Promise<UserEntity | null> {
    return await this.userRepository.findOne({
      where:arg,
      relations: ['role', 'demands', 'travels', 'activations', 'files', 'verificationLogs', 'verificationActions'],
    });
}


/**
   * Seeds an admin user when the application starts
   * This ensures there's always an admin user available for platform management
   */
private async seedAdminUser(): Promise<void> {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@gohappygo.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123456';
  const adminPhone = process.env.ADMIN_PHONE || '+1234567890';

  try {
    // Check if admin user already exists
    const existingAdmin = await this.userRepository.findOne({
      where: { email: adminEmail },
      relations: ['role']
    });

    if (existingAdmin) {
      console.log(`🟡 Admin user '${adminEmail}' already exists`);
      return;
    }

    // Get admin role
    const adminRole = await this.roleService.getUserRoleIdByCode('ADMIN');
    if (!adminRole) {
      console.log(`🔴 Admin role not found. Please ensure roles are seeded first.`);
      return;
    }

    // Check if phone number is already in use
    const existingPhone = await this.userRepository.findOne({
      where: { phone: adminPhone }
    });

    if (existingPhone) {
      console.log(`🔴 Phone number '${adminPhone}' is already in use. Please use a different phone number.`);
      return;
    }

    // Hash password
    const hashedPassword = await this.hashPassword(adminPassword);

    // Create admin user
    const adminUser = this.userRepository.create({
      firstName: 'Admin',
      lastName: 'User',
      email: adminEmail,
      phone: adminPhone,
      username: 'admin',
      password: hashedPassword,
      roleId: adminRole.id,
      isPhoneVerified: true,
      isVerified: true,
      profilePictureUrl: undefined
    });

    await this.userRepository.save(adminUser);
    console.log(`🟢 Admin user '${adminEmail}' created successfully`);
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔑 Password: ${adminPassword}`);
    console.log(`📱 Phone: ${adminPhone}`);
    console.log(`⚠️  Please change the default password after first login!`);
    console.log(`🔐 Role: ${adminRole.name}`);

  } catch (error) {
    console.error(`🔴 Failed to seed admin user:`, error.message);
    if (error.code === '23505') { // PostgreSQL unique constraint violation
      console.log(`💡 Admin user might already exist with different credentials.`);
    }
  }
}


/**
 * Seeds an operator user when the application starts
 * This ensures there's always an operator user available for operational tasks
 */
private async seedOperatorUser(): Promise<void> {
  const operatorEmail = process.env.OPERATOR_EMAIL || 'operator@gohappygo.com';
  const operatorPassword = process.env.OPERATOR_PASSWORD || 'operator123456';
  const operatorPhone = process.env.OPERATOR_PHONE || '+1234567891';

  try {
    // Check if operator user already exists
    const existingOperator = await this.userRepository.findOne({
      where: { email: operatorEmail },
      relations: ['role']
    });

    if (existingOperator) {
      console.log(`🟡 Operator user '${operatorEmail}' already exists`);
      return;
    }

    // Get operator role
    const operatorRole = await this.roleService.getUserRoleIdByCode('OPERATOR');
    if (!operatorRole) {
      console.log(`🔴 Operator role not found. Please ensure roles are seeded first.`);
      return;
    }

    // Check if phone number is already in use
    const existingPhone = await this.userRepository.findOne({
      where: { phone: operatorPhone }
    });

    if (existingPhone) {
      console.log(`🔴 Phone number '${operatorPhone}' is already in use. Please use a different phone number.`);
      return;
    }

    // Hash password
    const hashedPassword = await this.hashPassword(operatorPassword);

    // Create operator user
    const operatorUser = this.userRepository.create({
      firstName: 'Operator',
      lastName: 'User',
      email: operatorEmail,
      phone: operatorPhone,
      username: 'operator',
      password: hashedPassword,
      roleId: operatorRole.id,
      isPhoneVerified: true,
      isVerified: true,
      profilePictureUrl: undefined
    });

    await this.userRepository.save(operatorUser);
    console.log(`🟢 Operator user '${operatorEmail}' created successfully`);
    console.log(`📧 Email: ${operatorEmail}`);
    console.log(`🔑 Password: ${operatorPassword}`);
    console.log(`📱 Phone: ${operatorPhone}`);
    console.log(`⚠️  Please change the default password after first login!`);
    console.log(`🔐 Role: ${operatorRole.name}`);

  } catch (error) {
    console.error(`🔴 Failed to seed operator user:`, error.message);
    if (error.code === '23505') { // PostgreSQL unique constraint violation
      console.log(`💡 Operator user might already exist with different credentials.`);
    }
  }
}
}
