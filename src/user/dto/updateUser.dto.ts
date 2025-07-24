// create-user.dto.ts
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
  @IsNotEmpty({message:'firstName can not be empty'})
  @IsString({message:'firstName must be a string'})
  @MinLength(2, {message:'firstName must be atleast 2 charcters'})
  @MaxLength(40,{message:'firstName can not exceed 40 charcters'})
  firstName: string;


  @IsOptional()
  @IsString({message:'lastName must be a string'})
  @MinLength(2, {message:'lastName must be atleast 2 charcters'})
  @MaxLength(40,{message:'lastName can not exceed 40 charcters'})
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber: string;

  @IsNotEmpty()
  @MinLength(6,{message:'password must be atleast 6 charcters'})
  @MaxLength(32,{message:'password can not exceed 40 charcters'})
  password: string;

  @IsOptional()
  @IsString()
  profilePicture?: string;

  @IsOptional()
  roleId?: number; // e.g., defaults to user
}
