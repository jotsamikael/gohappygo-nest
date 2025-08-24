import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class VerifyPhoneDto {
  @ApiProperty({ description: 'User phone number', example: '+237694356789' })
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Phone number must be in international format' })
  phoneNumber: string;

  @ApiProperty({ description: '6-digit verification code sent via SMS' })
  @IsString()
  @Length(6, 6)
  verificationCode: string;
}