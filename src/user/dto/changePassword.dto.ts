// change-password.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiProperty({
    description: 'Current password',
    example: 'password123',
    minLength: 6,
    maxLength: 32
  })
  @IsNotEmpty()
  currentPassword: string;

  @ApiProperty({
    description: 'New password',
    example: 'password123',
    minLength: 6,
    maxLength: 32
  })
  @IsNotEmpty()
  @MinLength(6, { message: 'newPassword must be atleast 6 charcters' })
  @MaxLength(32, { message: 'newPassword can not exceed 40 charcters' })
  newPassword: string;
}
