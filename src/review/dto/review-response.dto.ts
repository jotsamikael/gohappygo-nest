import { ApiProperty } from "@nestjs/swagger";

export class ReviewResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'John' })
    comment: string;
}

export class CreateReviewResponseDto {
    @ApiProperty({ example: 'Review created successfully' })
    message: string;
    @ApiProperty({ example: ReviewResponseDto })
    review: ReviewResponseDto;
}