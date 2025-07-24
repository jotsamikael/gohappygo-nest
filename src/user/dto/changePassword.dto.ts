// change-password.dto.ts
import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty()
  currentPassword: string;

  @IsNotEmpty()
  @MinLength(6, { message: 'newPassword must be atleast 6 charcters' })
  @MaxLength(32, { message: 'newPassword can not exceed 40 charcters' })
  newPassword: string;
}
