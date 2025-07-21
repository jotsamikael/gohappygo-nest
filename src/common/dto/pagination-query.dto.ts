import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";

export class PaginationQueryDto{

    @IsOptional()
    @Type(()=> Number)
    @IsInt({message: 'Page must be an integer'})
    @Min(1,{message: 'Page must be an integer'})
    page?: number = 1

    @IsOptional()
    @Type(()=> Number)
    @IsInt({message: 'Limit must be an integer'})
    @Min(1,{message: 'Limit must be an integer'})
    @Max(100,{message: 'Limit must be an integer'})
    limit?: number = 10

}