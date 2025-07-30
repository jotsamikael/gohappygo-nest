import { IsNotEmpty, IsOptional } from "class-validator";

export class UpdateReviewDto{

      @IsNotEmpty()
      rating: number; // 1 to 5
    
      @IsOptional()
      comment: string;
}