import { IsOptional, IsString, MaxLength } from "class-validator";
import { PaginationQueryDto } from "src/common/dto/pagination-query.dto";


export class FindUserQueryDto  extends PaginationQueryDto{
     @IsOptional()
        @IsString({message:'Email must be a string'})
        @MaxLength(100,{message:'Email search can\'t be more than 100 characters'})
        email?:string;
}