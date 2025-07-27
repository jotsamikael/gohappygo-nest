import { IsNotEmpty, IsPhoneNumber, MinLength } from 'class-validator';

export class UpdatePhoneDto {
  @IsNotEmpty({ message: 'Old phone number can not be empty' })
  @IsPhoneNumber()
  oldPhoneNumber: string;

  @IsNotEmpty({ message: 'New phone number can not be empty' })
  @IsPhoneNumber()
  @MinLength(6, { message: 'New phone number must be atleast 6 charcters' })
  newPhoneNumber: string;
}
