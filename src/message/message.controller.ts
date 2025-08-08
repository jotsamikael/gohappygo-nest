import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorattor';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserEntity } from 'src/user/user.entity';
import { SendMessageDto } from './dto/SendMessage.dto';
import { MessageService } from './message.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { MessageResponseDto } from './dto/message-response.dto';

@ApiTags('messages')
@Controller('message')
export class MessageController {
    constructor(private readonly messageService: MessageService) {}

    // Send a message
    @Post()
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth') 
    @ApiOperation({ summary: 'Send a message' })
    @ApiBody({ type: SendMessageDto })
    @ApiResponse({ status: 200, description: 'Message sent successfully',type: MessageResponseDto })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async sendMessage(@CurrentUser() user: UserEntity, @Body() dto: SendMessageDto) {
      return this.messageService.sendMessage(user, dto);
    }
  
    // Get conversation thread by requestId
    @Get('thread/:requestId')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth') 
    @ApiOperation({ summary: 'Get conversation thread by requestId' })
    @ApiResponse({ status: 200, description: 'Conversation thread fetched successfully',type: MessageResponseDto })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async getThread(@Param('requestId', ParseIntPipe) requestId: number, @CurrentUser() user: UserEntity) {
      return this.messageService.getThread(requestId, user);
    }
  
    // Get unread message count for current user
    @Get('unread-count')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth') 
    @ApiOperation({ summary: 'Get unread message count for current user' })
    @ApiResponse({ status: 200, description: 'Unread message count fetched successfully',type: MessageResponseDto })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async getUnreadCount(@CurrentUser() user: UserEntity) {
      return this.messageService.getUnreadCount(user);
    }


    //mark thread as read
    @Patch('thread/:requestId/read')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('JWT-auth') 
    @ApiOperation({ summary: 'Mark thread as read' })
    @ApiResponse({ status: 200, description: 'Thread marked as read' })
    @ApiResponse({ status: 400, description: 'Bad request' })
    async markThreadAsRead(@Param('requestId', ParseIntPipe) requestId: number, @CurrentUser() user: UserEntity) {
      return this.messageService.markThreadAsRead(requestId, user);
    }
  }

