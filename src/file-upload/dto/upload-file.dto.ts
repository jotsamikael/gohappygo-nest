import { IsOptional, IsString, MaxLength } from "class-validator";
import { FilePurpose } from "src/uploaded-file/uploaded-file-purpose.enum";

export class UploadFileDto{
    @IsOptional()
    @IsString()
    @MaxLength(500)
    purpose:FilePurpose

}