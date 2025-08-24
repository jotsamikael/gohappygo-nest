import { ApiProperty } from '@nestjs/swagger';

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

  @ApiProperty({ example: false })
  isPhoneVerified: boolean;

  @ApiProperty({ example: false })
  isVerified: boolean;
}

export class RegisterResponseDto {
  @ApiProperty()
  user: UserResponseDto;

  @ApiProperty({ example: 'User registered successfully. Please verify your phone number.' })
  message: string;
}

export class LoginResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refresh_token: string;

  @ApiProperty()
  user: UserResponseDto;
}

export class VerifyEmailResponseDto{
  @ApiProperty({ example: 'Email verified successfully' })
  message: string;

  @ApiProperty()
  user: UserResponseDto;
}

export class VerifyPhoneResponseDto {
  @ApiProperty({ example: 'Email verified successfully' })
  message: string;

  @ApiProperty()
  user: UserResponseDto;
}

export class RefreshTokenResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  access_token: string;
} 


export class UploadedFileResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'selfie.jpg' })
  originalName: string;

  @ApiProperty({ example: 'https://cloudinary.com/selfie.jpg' })
  url: string;

  @ApiProperty({ example: 'SELFIE' })
  purpose: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  uploadedAt: Date;
}

export class UploadVerificationResponseDto {
  @ApiProperty({ example: 'Verification documents uploaded successfully' })
  message: string;

  @ApiProperty({ type: [UploadedFileResponseDto] })
  files: UploadedFileResponseDto[];
}