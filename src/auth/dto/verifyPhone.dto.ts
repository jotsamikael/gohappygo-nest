import { IsNotEmpty, IsPhoneNumber, Length, MaxLength } from 'class-validator';

export class VerifyPhoneDto {
  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber: string;

  @IsNotEmpty()
  @IsPhoneNumber()
  @MaxLength(5, { message: 'Activation code must be 5 digits' })
  activationCode: string;
}
