import { ApiProperty } from "@nestjs/swagger";

export class UserResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'John' })
    name: string;
}

export class CreateUserResponseDto {
    @ApiProperty({ example: 'User created successfully' })
    message: string;
    @ApiProperty({ example: UserResponseDto })
    user: UserResponseDto;
}