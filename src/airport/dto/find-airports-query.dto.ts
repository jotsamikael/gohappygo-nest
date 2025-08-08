import { ApiProperty } from "@nestjs/swagger";

export class FindAirportsQueryDto{
    @ApiProperty({
        description: 'The name of the airport',
        required: false,
        example: 'John'
    })
    name: string;
}