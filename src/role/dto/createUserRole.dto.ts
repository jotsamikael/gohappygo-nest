

// create-user-role.dto.ts
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateUserRoleDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  name: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(30)
  code: string; // e.g., 'USER', 'ADMIN', etc.


  @IsOptional()
  @IsString()
  @MaxLength(500)
  description: string;
}
