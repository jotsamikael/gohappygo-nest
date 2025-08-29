import { ApiProperty } from "@nestjs/swagger";

export class AirportResponseDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'KJFK' })
    ident: string;

    @ApiProperty({ example: 'large_airport' })
    type: string;

    @ApiProperty({ example: 'John F Kennedy International Airport' })
    name: string;

    @ApiProperty({ example: 40.6413, nullable: true })
    latitudeDeg: number;

    @ApiProperty({ example: -73.7781, nullable: true })
    longitudeDeg: number;

    @ApiProperty({ example: 13, nullable: true })
    elevationFt: number;

    @ApiProperty({ example: 'NA', nullable: true })
    continent: string;

    @ApiProperty({ example: 'US', nullable: true })
    isoCountry: string;

    @ApiProperty({ example: 'US-NY', nullable: true })
    isoRegion: string;

    @ApiProperty({ example: 'New York', nullable: true })
    municipality: string;

    @ApiProperty({ example: 'yes', nullable: true })
    scheduledService: string;

    @ApiProperty({ example: 'KJFK', nullable: true })
    icaoCode: string;

    @ApiProperty({ example: 'JFK', nullable: true })
    iataCode: string;

    @ApiProperty({ example: 'KJFK', nullable: true })
    gpsCode: string;

    @ApiProperty({ example: 'JFK', nullable: true })
    localCode: string;

    @ApiProperty({ example: 'https://www.panynj.gov/airports/jfk.html', nullable: true })
    homeLink: string;

    @ApiProperty({ example: 'https://en.wikipedia.org/wiki/John_F._Kennedy_International_Airport', nullable: true })
    wikipediaLink: string;

    @ApiProperty({ example: 'JFK, Kennedy, New York airport', nullable: true })
    keywords: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
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