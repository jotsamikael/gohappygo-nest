import { IsNotEmpty, IsOptional } from "class-validator";

export class CreateReviewDto{

      @IsNotEmpty()
      reviewerId: number;
    
      @IsNotEmpty()
      revieweeId: number;

      @IsNotEmpty()
      rating: number; // 1 to 5
    
      @IsOptional()
      comment: string;
}