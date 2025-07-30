import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ReviewEntity } from './review.entity';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { UpdateReviewDto } from './dto/updateReview.dto';
import { CreateReviewDto } from './dto/createReview.dto';

@Injectable()
export class ReviewService {

    constructor(@InjectRepository(ReviewEntity) private reviewRepository: Repository<ReviewEntity>,
                private userService: UserService){}

    async addReview(user:UserEntity,reviewDto: CreateReviewDto): Promise<ReviewEntity>{
      const review = this.reviewRepository.create({
        revieweeId: reviewDto.revieweeId,
        reviewerId:user.id,
        rating:reviewDto.rating,
        comment:reviewDto.comment,
        reviewer:user,
        reviewee: await this.userService.getUserById(reviewDto.revieweeId)
      })

     return await this.reviewRepository.save(review);
    }

    async getReviewById(id: number): Promise<ReviewEntity | null>{
      const review = await this.reviewRepository.findOneBy({id:id});

      if(!review){
        throw new NotFoundException(`No review found with id ${id}`);
      }
      return review;
    }


    //reviews posted by user
   async getReviewByUser(userId: number): Promise<ReviewEntity[]> {
    return this.reviewRepository.find({
      where: { reviewerId: userId },
      relations: ['reviewee', 'reviewer'], // include user info if needed
      order: { id: 'DESC' }, // or 'createdAt' if you have a timestamp
    });
  }

    //reviews received by posted
    getReviewOfUser(id: number): Promise<ReviewEntity[] | null>{
      return this.reviewRepository.find({
        where: { revieweeId: id },
        relations: ['reviewee', 'reviewer'], // include user info if needed
        order: { id: 'DESC' }, // or 'createdAt' if you have a timestamp
      });
    }

    async editReview(reviewId: number, user: UserEntity, updateDto: UpdateReviewDto): Promise<ReviewEntity> {
      const review = await this.reviewRepository.findOne({ where: { id: reviewId } });
    
      if (!review) {
        throw new NotFoundException('Review not found');
      }
      if (review.reviewerId !== user.id) {
        throw new ForbiddenException('You can only edit your own reviews');
      }
    
      const now = new Date();
      const createdAt = new Date(review.createdAt);
      const diffMs = now.getTime() - createdAt.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
    
      if (diffDays > 1) {
        throw new BadRequestException('You can only edit a review within 1 day of submission');
      }
    
      // Update fields
      if (updateDto.rating !== undefined) review.rating = updateDto.rating;
      if (updateDto.comment !== undefined) review.comment = updateDto.comment;
    
      return this.reviewRepository.save(review);
    }

}
