import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator"

export class RegisterDto{

    @IsEmail({}, {message:'Provide a valid email'})
    email: string

    @IsNotEmpty({message: 'Role is required'})
    roleId


     @IsString({message:'Name must be a string'})
    @IsNotEmpty({message: 'Title is required'})
     @MinLength(3, {message:'Must be atleast 3 characters long'})
    @MaxLength(50, {message:'Can not be more than 50 characters long'})
    name: string

    @IsNotEmpty({message: 'Title is required'})
     @MinLength(6, {message:'Must be atleast 3 characters long'})
    @MaxLength(16, {message:'Can not be more than 50 characters long'})
    password: string
}