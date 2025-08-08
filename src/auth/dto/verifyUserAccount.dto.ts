import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { boolean } from "joi";

export class VerifyUserAccountDto {
  @ApiProperty({
    description: 'Approval status',
    example: true
  })
  @IsNotEmpty({ message: 'Approval status is mandatory' })
  approved: boolean;

  @ApiProperty({
    description: 'Reason for approval',
    example: 'Valid identification documents'
  })
  @IsOptional()
  @IsString({ message: 'reason must be a string' })
  @MinLength(2, { message: 'reason must be atleast 2 charcters' })
  @MaxLength(40, { message: 'reason can not exceed 40 charcters' })
  reason?: string;
}