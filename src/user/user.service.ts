import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
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
export class UserService {
   
 
   

  //injecting service from another module
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private roleService: RoleService,
  ) {}

  async findByField(
    field: string,
    value: string,
    includeDeleted = true,
  ): Promise<UserEntity | null> {
    return this.userRepository.findOne({
      where: {
        [field]: value,
      },
      withDeleted: includeDeleted,
    });
  }

  async getAllOperators(): Promise<UserEntity[] | null> {
    const operatorRole =  await this.roleService.getUserRoleIdByCode('OPERATOR');
    return this.userRepository.findBy({roleId:operatorRole?.id});
  }


   async getUserByPhone(phone: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findOneBy({ phone });
    if (!user) {
      throw new NotFoundException(`User with phone ${phone} not found`);
    }
    return user;
  }

  async getUserByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }

  async getUserById(id: number): Promise<UserEntity> {
    const user = await this.userRepository.findOneBy({ id });
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

 async getUserProfile(user:UserEntity): Promise<UserEntity | null> {
 
  const userProfile = this.userRepository.findOne({
    where: { id:user.id },
    relations: [
      'role',
      'demands',
      'travels',
      'activations',
      'files',
      'verificationLogs',
      'verificationActions',
    ],
  });
   if(!userProfile){
     throw new NotFoundException(`User profile not found`)
   }

   return userProfile;
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

        if(!foundUser){
          throw new NotFoundException(`User not found`)

        }
        //if old and new phone number are the save, cancel
       if( updatePhoneDto.newPhoneNumber =  updatePhoneDto.oldPhoneNumber){
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

}
