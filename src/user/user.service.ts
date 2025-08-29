import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from './user.entity';
import { FindOptionsWhere, Repository, UpdateResult } from 'typeorm';
import { CreateUserDto } from './dto/request/createUser.dto';
import { RoleService } from 'src/role/role.service';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/request/updateUser.dto';
import { ChangePasswordDto } from './dto/request/changePassword.dto';
import { UpdatePhoneDto } from './dto/request/UpdatePhone.dto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { FindUsersQueryDto } from 'src/auth/dto/FindUsersQuery.dto';
import { PaginatedResponse } from 'src/common/interfaces/paginated-reponse.interfaces';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UserService implements OnModuleInit {

  private userListCacheKeys: Set<string> = new Set();

  //injecting service from another module
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private roleService: RoleService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache

  ) { }

  async onModuleInit() {
    await this.seedAdminUser();
    await this.seedOperatorUser();
  }


  async getAllUsers(query: FindUsersQueryDto): Promise<PaginatedResponse<UserEntity>> {
    const cacheKey = this.generateUserListCacheKey(query);
    this.userListCacheKeys.add(cacheKey);

    // Check cache first
    const cachedData = await this.cacheManager.get<PaginatedResponse<UserEntity>>(cacheKey);
    if (cachedData) {
      console.log(`Cache Hit---------> Returning users list from Cache ${cacheKey}`);
      return cachedData;
    }
    console.log(`Cache Miss---------> Returning users list from database`);

    const {
      page = 1,
      limit = 10,
      email,
      phone,
      roleId,
      isPhoneVerified,
      isVerified,
      createdDate,
      orderBy = 'createdAt:desc'
    } = query;

    // Debug: Log the received values
    console.log('🔍 Debug - Received query parameters:');
    console.log('isPhoneVerified:', isPhoneVerified, 'Type:', typeof isPhoneVerified);
    console.log('isVerified:', isVerified, 'Type:', typeof isVerified);

    const skip = (page - 1) * limit;

    // Build the query with LEFT JOIN to include role relation
    const queryBuilder = this.userRepository.createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role') // Add this line to include role relation
      .skip(skip)
      .take(limit);

    // Apply filters
    if (email) {
      queryBuilder.andWhere('LOWER(user.email) LIKE LOWER(:email)', { email: `%${email}%` });
    }

    if (phone) {
      queryBuilder.andWhere('LOWER(user.phone) LIKE LOWER(:phone)', { phone: `%${phone}%` });
    }

    if (roleId) {
      queryBuilder.andWhere('user.roleId = :roleId', { roleId });
    }

    // Debug: Check if filters are being applied
    if (isPhoneVerified !== undefined && isPhoneVerified !== null) {
      console.log('🔍 Applying isPhoneVerified filter:', isPhoneVerified);
      queryBuilder.andWhere('user.isPhoneVerified = :isPhoneVerified', { isPhoneVerified });
    } else {
      console.log('🔍 isPhoneVerified filter NOT applied (undefined/null)');
    }

    if (isVerified !== undefined && isVerified !== null) {
      console.log('🔍 Applying isVerified filter:', isVerified);
      queryBuilder.andWhere('user.isVerified = :isVerified', { isVerified });
    } else {
      console.log('🔍 isVerified filter NOT applied (undefined/null)');
    }

    if (createdDate) {
      const dateString = new Date(createdDate).toISOString().split('T')[0];
      queryBuilder.andWhere('DATE(user.created_at) = :dateString', { dateString });
    }

    // Debug: Log the final SQL query
    console.log(' Final SQL Query:', queryBuilder.getSql());

    // Apply sorting
    const [sortField, sortDirection] = orderBy.split(':');
    const validSortFields = ['createdAt'];
    const validSortDirections = ['asc', 'desc'];

    if (validSortFields.includes(sortField) && validSortDirections.includes(sortDirection)) {
      queryBuilder.orderBy(`user.${sortField}`, sortDirection.toUpperCase() as 'ASC' | 'DESC');
    } else {
      queryBuilder.orderBy('user.createdAt', 'DESC'); // default
    }

    // Get the count first (without joins to avoid complex queries)
    const countQueryBuilder = this.userRepository.createQueryBuilder('user');
    
    // Apply the same filters to count query
    if (email) {
      countQueryBuilder.andWhere('LOWER(user.email) LIKE LOWER(:email)', { email: `%${email}%` });
    }
    if (phone) {
      countQueryBuilder.andWhere('LOWER(user.phone) LIKE LOWER(:phone)', { phone: `%${phone}%` });
    }
    if (roleId) {
      countQueryBuilder.andWhere('user.roleId = :roleId', { roleId });
    }
    if (isPhoneVerified !== undefined && isPhoneVerified !== null) {
      countQueryBuilder.andWhere('user.isPhoneVerified = :isPhoneVerified', { isPhoneVerified });
    }
    if (isVerified !== undefined && isVerified !== null) {
      countQueryBuilder.andWhere('user.isVerified = :isVerified', { isVerified });
    }
    if (createdDate) {
      const dateString = new Date(createdDate).toISOString().split('T')[0];
      countQueryBuilder.andWhere('DATE(user.created_at) = :dateString', { dateString });
    }

    const totalItems = await countQueryBuilder.getCount();
    console.log('🔍 Total items found:', totalItems);

    const items = await queryBuilder.getMany();
    console.log(' Items retrieved:', items.length);

    const totalPages = Math.ceil(totalItems / limit);

    const responseResult = {
      items,
      meta: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems,
        totalPages,
        hasPreviousPage: page > 1,
        hasNextPage: page < totalPages
      }
    };

    await this.cacheManager.set(cacheKey, responseResult, 30000);
    return responseResult;

  }



   async getUserByPhone(phone: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findOne({ where:{phone}, relations: ['role'] });
    if (!user) {
      throw new NotFoundException(`User with phone ${phone} not found`);
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

  async createUser(createUserDto: CreateUserDto, user: UserEntity) {
    const role = await this.roleService.getUserRoleIdByCode('USER');

    const hashedPassword = await this.hashPassword('123456');

    const newUser = this.userRepository.create({
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      email: createUserDto.email,
      phone: createUserDto.phoneNumber,
      roleId: createUserDto.roleId,
      password: hashedPassword,
      isDeactivated: false,
      createdBy: user.id
    });
    const saveUser = await this.userRepository.save(newUser);
    const { password, ...result } = saveUser;
    return {
      user: result,
      message: 'Admin created successfully, login to continue',
    };
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

/**
 * Toggle staff member activation status
 * @param id - The ID of the staff member
 * @param isDeactivated - The desired activation status
 * @param user - The user making the request
 * @returns The updated staff member
 */
async toggleStaffActivation(
  id: number, 
  isDeactivated: boolean, 
  user: UserEntity
): Promise<UserResponseDto> {
  const currentUser = await this.getUserById(id);
  
  // Prevent self-deactivation
  if (currentUser.id === user.id) {
    throw new BadRequestException('You cannot deactivate your own account');
  }
  
  currentUser.isDeactivated = isDeactivated;
  currentUser.updatedBy = user.id;
  
  const updatedUser = await this.userRepository.save(currentUser);
  
  // Clear cache after update
  await this.clearUserListCache();
  
  // Return the mapped DTO instead of raw entity
  return this.mapToUserResponseDto(updatedUser);
}

// Add this mapping method if it doesn't exist
private mapToUserResponseDto(user: UserEntity): UserResponseDto {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    username: user.username,
    profilePictureUrl: user.profilePictureUrl,
    role: user.role || {
      id: 0,
      code: 'UNKNOWN',
      name: 'Unknown Role',
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      createdBy: null
    },
    isVerified: user.isVerified,
    isPhoneVerified: user.isPhoneVerified,
    isDeactivated: user.isDeactivated,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
    // Remove deletedAt, createdBy, updatedBy - they don't exist in UserResponseDto
  };
}

  /**
   * Update staff member details
   * @param id - The ID of the staff member to update
   * @param updateUserDto - The data to update the staff member with
   * @param user - The user making the request
   * @returns The updated staff member
   */
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

    // Clear the cache after updating
    await this.clearUserListCache();

    // Optionally emit updated event
    // this.userEventService.emitUserUpdated(updatedUser);

    return updatedUser;
  }

/**
 * Set user phone verified
 * @param user - The user to set to phone verified
 * @returns The user with phone verified set to true
 */
  async setToUserPhoneVerified(user: UserEntity) {
    user.isPhoneVerified = true;
    await this.userRepository.save(user);

  }
/**
 * Update password
 * @param id 
 * @param changePasswordDto 
 * @returns 
 */
  async updatePassword(id: number, changePasswordDto: ChangePasswordDto) {
    //get current user
    const currentUser = await this.getUserById(id);
    //if current password of user matches dto password
    if (!await this.verifyPassword(changePasswordDto.currentPassword, currentUser.password)) {
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

/**
 * Update user profile
 * @param user - The user to update
 * @param updateUserDto - The data to update the user with
 * @returns The updated user
 */
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

/**
 * Update phone number
 * @param user 
 * @param updatePhoneDto 
 * @returns 
 */
  async updatePhoneNumber(user: UserEntity, updatePhoneDto: UpdatePhoneDto) {

    //get user
    const foundUser = await this.getUserById(user.id)
    console.log(foundUser)

    if (!foundUser) {
      throw new NotFoundException(`User not found`)

    }
    //if old and new phone number are the save, cancel
    if (updatePhoneDto.newPhoneNumber == updatePhoneDto.oldPhoneNumber) {
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

  /**
   * Delete staff member
   * @param id - The ID of the staff member to delete
   * @returns The deleted staff member
   */
  async deleteStaff(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} was not found`);
    }
    await this.userRepository.softDelete(id);
    await this.clearUserListCache();
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
      where: arg,
      relations: ['role', 'demands', 'travels', 'activations', 'files', 'verificationLogs', 'verificationActions'],
    });
  }


  private generateUserListCacheKey(query: FindUsersQueryDto): string {
    const {
      page = 1,
      limit = 10,
      email,
      phone,
      roleId,
      isPhoneVerified,
      isVerified,
      createdDate,
      orderBy = 'createdAt:desc'
    } = query;

    return `users_list_page${page}_limit${limit}_email${email || 'all'}_phone${phone || 'all'}_roleId${roleId || 'all'}_roleId${isPhoneVerified || 'all'}_roleId${isVerified || 'all'}_created_at${createdDate || 'all'}_order${orderBy}`;
  }


  /**
     * Seeds an admin user when the application starts
     * This ensures there's always an admin user available for platform management
     */
  private async seedAdminUser(): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gohappygo.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'password123';
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
    const operatorPassword = process.env.OPERATOR_PASSWORD || 'password123';
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

  // Add this method to clear user list cache
  private async clearUserListCache(): Promise<void> {
    // Clear all user list cache keys
    for (const cacheKey of this.userListCacheKeys) {
      await this.cacheManager.del(cacheKey);
    }
    this.userListCacheKeys.clear();
  }
}
