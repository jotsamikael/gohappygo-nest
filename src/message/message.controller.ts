import { Body, Controller, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorattor';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserEntity } from 'src/user/user.entity';
import { SendMessageDto } from './dto/SendMessage.dto';
import { MessageService } from './message.service';

@Controller('message')
export class MessageController {
    constructor(private readonly messageService: MessageService) {}

    // Send a message
    @Post()
    @UseGuards(JwtAuthGuard)
    async sendMessage(@CurrentUser() user: UserEntity, @Body() dto: SendMessageDto) {
      return this.messageService.sendMessage(user, dto);
    }
  
    // Get conversation thread by requestId
    @Get('thread/:requestId')
    @UseGuards(JwtAuthGuard)
    async getThread(@Param('requestId', ParseIntPipe) requestId: number, @CurrentUser() user: UserEntity) {
      return this.messageService.getThread(requestId, user);
    }
  
    // Get unread message count for current user
    @Get('unread-count')
    @UseGuards(JwtAuthGuard)
    async getUnreadCount(@CurrentUser() user: UserEntity) {
      return this.messageService.getUnreadCount(user);
    }
  }

