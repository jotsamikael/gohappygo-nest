import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";
import { PaginationQueryDto } from "src/common/dto/pagination-query.dto";

export class FindDemandsQueryDto extends PaginationQueryDto{
  @ApiProperty({
    description: 'Filter demands by title (optional)',
    example: 'Package delivery from New York',
    minLength: 2,
    maxLength: 500,
    required: false
})
    @IsOptional()
    @IsString({message:'Title must be a string'})
    @MaxLength(500,{message:'Title search can\'t be more than 500 characters'})
    title?:string;

}