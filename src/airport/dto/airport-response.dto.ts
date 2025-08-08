import { ApiProperty } from "@nestjs/swagger";

export class AirportResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'John' })
  name: string;
}

export class CreateAirportResponseDto {
    @ApiProperty({ example: 'Airport created successfully' })
    message: string;

    @ApiProperty({ example: AirportResponseDto })
    airport: AirportResponseDto;
}

export class UpdateAirportResponseDto {
    @ApiProperty({ example: 'Airport updated successfully' })
    message: string;
}