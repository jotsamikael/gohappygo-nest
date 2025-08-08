import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";
import { PaginationQueryDto } from "src/common/dto/pagination-query.dto";

export class FindTravelsQueryDto extends PaginationQueryDto{
    @ApiProperty({
        description: 'Title of the travel',
        example: 'Travel to London',
        minLength: 2,
        maxLength: 500,
        required: false
      })
    @IsOptional()
    @IsString({message:'Title must be a string'})
    @MaxLength(500,{message:'Title search can\'t be more than 500 characters'})
    title?:string;

}