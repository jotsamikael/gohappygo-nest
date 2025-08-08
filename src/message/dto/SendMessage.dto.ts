// src/message/dto/send-message.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SendMessageDto {
  @ApiProperty({
    description: 'Request id',
    example: 1,
    minLength: 1,
    maxLength: 10
  })
  @IsNotEmpty()
  @IsNumber()
  requestId: number;

  @IsNotEmpty()
  @IsNumber()
  receiverId: number;

  @IsNotEmpty()
  @IsString()
  content: string;
}