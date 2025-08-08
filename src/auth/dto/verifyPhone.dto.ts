import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber, Length, MaxLength } from 'class-validator';

export class VerifyPhoneDto {
  @ApiProperty({
    description: 'User phone number',
    example: '+237694356789'
  })
  @IsNotEmpty()
  @IsPhoneNumber()
  phoneNumber: string;

  @ApiProperty({
    description: 'Activation code',
    example: '12345'
  })
  @IsNotEmpty()
  @MaxLength(5, { message: 'Activation code must be 5 digits' })
  activationCode: string;
}
