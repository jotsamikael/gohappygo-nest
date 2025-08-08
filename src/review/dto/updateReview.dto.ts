import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional } from "class-validator";

export class UpdateReviewDto{

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