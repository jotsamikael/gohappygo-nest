/*jotsamikael
*This dto is used exclusively for creating back-office users e.g admins and operators
*App users must register
*/
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  IsString,
  IsOptional,
  IsPhoneNumber,
} from 'class-validator';

export class CreateUserDto {
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

  @IsOptional()
  @IsString()
  profilePicture?: string;

  @IsOptional()
  roleId?: number; // e.g., defaults to operator
}
