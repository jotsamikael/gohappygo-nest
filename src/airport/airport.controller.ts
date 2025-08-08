import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { AirportService } from './airport.service';
import { CreateAirportDto } from './dto/create-airport.dto';
import { UpdateAirportDto } from './dto/update-airport.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AirportResponseDto } from './dto/airport-response.dto';
import { FindAirportsQueryDto } from './dto/find-airports-query.dto';

@ApiTags('airport')
@Controller('airport')
export class AirportController {
  constructor(private readonly airportService: AirportService) {}

  @Post()
  @ApiBearerAuth('JWT-auth') 
  @ApiOperation({ summary: 'Create an airport' })
  @ApiBody({ type: CreateAirportDto })
  @ApiResponse({ status: 201, description: 'Airport created successfully',type: AirportResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createAirportDto: CreateAirportDto) {
    return this.airportService.create(createAirportDto);
  }

  @Get()
  @ApiBearerAuth('JWT-auth') 
  @ApiOperation({ summary: 'Get all airports' })
  @ApiQuery({ type: FindAirportsQueryDto })
  @ApiResponse({ status: 200, description: 'Airports fetched successfully', type: AirportResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  findAll() {
    return this.airportService.findAll();
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth') 
  @ApiOperation({ summary: 'Get an airport by id' })
  @ApiResponse({ status: 200, description: 'Airport fetched successfully', type: AirportResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.airportService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth') 
  @ApiOperation({ summary: 'Update an airport' })
  @ApiBody({ type: UpdateAirportDto })
  @ApiResponse({ status: 200, description: 'Airport updated successfully', type: AirportResponseDto })
  @ApiResponse({ status: 400, description: 'Bad request' })
  update(@Param('id', ParseIntPipe) id: number, @Body() updateAirportDto: UpdateAirportDto) {
    return this.airportService.update(id, updateAirportDto);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth') 
  @ApiOperation({ summary: 'Delete an airport' })
  @ApiResponse({ status: 200, description: 'Airport deleted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.airportService.remove(id);
  }
}
