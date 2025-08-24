import { ApiProperty } from '@nestjs/swagger';
import { UserRoleResponseDto } from 'src/role/dto/role-response.dto';

export class UserResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ example: '+1234567890' })
  phone: string;

  @ApiProperty({ example: 'john_doe' })
  username: string;

  @ApiProperty({ example: 'https://example.com/profile.jpg' })
  profilePictureUrl: string;

  @ApiProperty({ type: UserRoleResponseDto })
  role: UserRoleResponseDto;

  @ApiProperty({ example: false })
  isDeactivated: boolean;

  @ApiProperty({ example: false })
  isPhoneVerified: boolean;

  @ApiProperty({ example: false })
  isVerified: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: Date;
}

export class CreateUserResponseDto {    
    @ApiProperty({ example: 'User created successfully' })
    message: string;
    @ApiProperty({ example: UserResponseDto })
    user: UserResponseDto;
}


export class PaginatedUserResponseDto{
  @ApiProperty({ type: [UserResponseDto] })
  data: UserResponseDto[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 10 })
  totalPages: number;
}