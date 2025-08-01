import { IsOptional, IsString, MaxLength } from "class-validator";
import { PaginationQueryDto } from "src/common/dto/pagination-query.dto";

export class FindRolesQueryDto extends PaginationQueryDto{
    @IsOptional()
    @IsString({message:'Code must be a string'})
    @MaxLength(100,{message:'code search can\'t be more than 100 characters'})
    code?:string;

}