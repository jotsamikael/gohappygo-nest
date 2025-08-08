import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateReviewDto{

      @ApiProperty({
        description: 'Reviewer id',
        example: 1,
        minLength: 1,
        maxLength: 10
      })
      @IsNotEmpty()
      reviewerId: number;
    
      @ApiProperty({
        description: 'Reviewee id',
        example: 1,
        minLength: 1,
        maxLength: 10
      })
      @IsNotEmpty()
      revieweeId: number;

      @ApiProperty({
        description: 'Rating',
        example: 1,
        minLength: 1,
        maxLength: 10
      })
      @IsNotEmpty()
      rating: number; // 1 to 5
    
      @ApiProperty({
        description: 'Comment',
        example: 'This is a comment',
        minLength: 1,
        maxLength: 2500
      })
      @IsOptional()
      comment: string;
}