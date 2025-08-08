import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewEntity } from './review.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  imports:[TypeOrmModule.forFeature([ReviewEntity]),UserModule],
  controllers: [ReviewController],
  providers: [ReviewService],
  exports:[ReviewService]
})
export class ReviewModule {}
