import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/decorators/current-user.decorattor';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { UserEntity } from 'src/user/user.entity';
import { CreateReviewDto } from './dto/createReview.dto';
import { ReviewService } from './review.service';
import { UpdateReviewDto } from './dto/updateReview.dto';

@Controller('review')
export class ReviewController {

constructor(private reviewService: ReviewService){}

//Create a Review
@Post()
@UseGuards(JwtAuthGuard)
async addReview(@CurrentUser() user: UserEntity, @Body() createReviewDto: CreateReviewDto) {
  return this.reviewService.addReview(user, createReviewDto);
}

//Get a Review by ID
@Get(':id')
@UseGuards(JwtAuthGuard)
async getReviewById(@Param('id') id: number) {
  return this.reviewService.getReviewById(id);
}

//Get Reviews Written by a User
@Get('/by-user/:id')
@UseGuards(JwtAuthGuard)
async getReviewByUser(@Param('id', ParseIntPipe) id: number) {
  return this.reviewService.getReviewByUser(id);
}

//Get all Reviews of a User
@Get('/of-user/:id')
@UseGuards(JwtAuthGuard)
async getReviewOfUser(@Param('id', ParseIntPipe) id: number) {
  return this.reviewService.getReviewOfUser(id);
}

@Patch(':id')
@UseGuards(JwtAuthGuard)
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
async getMyReviews(@CurrentUser() user: any) {
  return this.reviewService.getReviewByUser(user.id);
}

}
