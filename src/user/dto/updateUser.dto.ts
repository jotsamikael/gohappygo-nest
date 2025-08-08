// create-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsString,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';

export class UpdateUserDto {
    @ApiProperty({
        description: 'First name',
        example: 'John',
        minLength: 2,
        maxLength: 40
      })
  @IsNotEmpty({message:'firstName can not be empty'})
  @IsString({message:'firstName must be a string'})
  @MinLength(2, {message:'firstName must be atleast 2 charcters'})
  @MaxLength(40,{message:'firstName can not exceed 40 charcters'})
  firstName: string;

  @ApiProperty({
    description: 'Last name',
    example: 'Doe',
    minLength: 2,
    maxLength: 40
  })
  @IsOptional()
  @IsString({message:'lastName must be a string'})
  @MinLength(2, {message:'lastName must be atleast 2 charcters'})
  @MaxLength(40,{message:'lastName can not exceed 40 charcters'})
  lastName: string;

  @ApiProperty({
    description: 'Email',
    example: 'john.doe@example.com',
    minLength: 1,
    maxLength: 100
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Phone number',
    example: '+1234567890',
    minLength: 1,
    maxLength: 15
  })
  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber: string;

  @ApiProperty({
    description: 'Password',
    example: 'password123',
    minLength: 6,
    maxLength: 32
  })
  @IsNotEmpty()
  @MinLength(6,{message:'password must be atleast 6 charcters'})
  @MaxLength(32,{message:'password can not exceed 40 charcters'})
  password: string;

  @ApiProperty({
    description: 'Profile picture',
    example: 'https://example.com/profile.jpg',
    minLength: 1,
    maxLength: 255
  })
  @IsOptional()
  @IsString()
  profilePicture?: string;

  @ApiProperty({
    description: 'Role id',
    example: 1,
    minLength: 1,
    maxLength: 10
  })
  @IsOptional()
  roleId?: number; // e.g., defaults to user
}
