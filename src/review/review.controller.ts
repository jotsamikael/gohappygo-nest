import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorattor';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserEntity } from 'src/user/user.entity';
import { CreateReviewDto } from './dto/createReview.dto';
import { ReviewService } from './review.service';
import { UpdateReviewDto } from './dto/updateReview.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReviewResponseDto } from './dto/review-response.dto';

@ApiTags('reviews')
@Controller('review')
export class ReviewController {

constructor(private reviewService: ReviewService){}

//Create a Review
@Post()
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth') 
@ApiOperation({ summary: 'Create a review' })
@ApiBody({ type: CreateReviewDto })
@ApiResponse({ status: 201, description: 'Review created successfully',type: ReviewResponseDto })
@ApiResponse({ status: 400, description: 'Bad request' })
async addReview(@CurrentUser() user: UserEntity, @Body() createReviewDto: CreateReviewDto) {
  return this.reviewService.addReview(user, createReviewDto);
}

//Get a Review by ID
@Get(':id')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth') 
@ApiOperation({ summary: 'Get a review by id' })
@ApiResponse({ status: 200, description: 'Review fetched successfully',type: ReviewResponseDto })
@ApiResponse({ status: 400, description: 'Bad request' })
async getReviewById(@Param('id') id: number) {
  return this.reviewService.getReviewById(id);
}

//Get Reviews Written by a User
@Get('/by-user/:id')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth') 
@ApiOperation({ summary: 'Get reviews by user id' })
@ApiResponse({ status: 200, description: 'Reviews fetched successfully',type: ReviewResponseDto })
@ApiResponse({ status: 400, description: 'Bad request' })
async getReviewByUser(@Param('id', ParseIntPipe) id: number) {
  return this.reviewService.getReviewByUser(id);
}

//Get all Reviews of a User
@Get('/of-user/:id')
@ApiBearerAuth('JWT-auth') 
@ApiOperation({ summary: 'Get reviews of a user' })
@ApiResponse({ status: 200, description: 'Reviews fetched successfully',type: ReviewResponseDto })
@ApiResponse({ status: 400, description: 'Bad request' })
@UseGuards(JwtAuthGuard)
async getReviewOfUser(@Param('id', ParseIntPipe) id: number) {
  return this.reviewService.getReviewOfUser(id);
}

@Patch(':id')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth') 
@ApiOperation({ summary: 'Edit a review' })
@ApiResponse({ status: 200, description: 'Review updated successfully',type: ReviewResponseDto })
@ApiResponse({ status: 400, description: 'Bad request' })
async editReview(
  @Param('id', ParseIntPipe) id: number,
  @CurrentUser() user: UserEntity,
  @Body() updateReviewDto: UpdateReviewDto
) {
  return this.reviewService.editReview(id, user, updateReviewDto);
}

//Get all Reviews of the current user
@Get('/me')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth') 
@ApiOperation({ summary: 'Get reviews of the current user' })
@ApiResponse({ status: 200, description: 'Reviews fetched successfully',type: ReviewResponseDto })
@ApiResponse({ status: 400, description: 'Bad request' })
async getMyReviews(@CurrentUser() user: any) {
  return this.reviewService.getReviewByUser(user.id);
}

}
