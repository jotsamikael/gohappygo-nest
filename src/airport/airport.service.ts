import { Injectable, OnModuleInit } from '@nestjs/common';
import { CreateAirportDto } from './dto/create-airport.dto';
import { UpdateAirportDto } from './dto/update-airport.dto';
import { AirportEntity } from './entities/airport.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';


@Injectable()
export class AirportService implements OnModuleInit {

  async onModuleInit() {
    await this.seedAirportData();
  }

  constructor(
    @InjectRepository(AirportEntity)
    private readonly airportRepository: Repository<AirportEntity>){}

  //create airport
  create(createAirportDto: CreateAirportDto) {
    const airport = this.airportRepository.create(createAirportDto)
    return this.airportRepository.save(airport)
  }

  findAll() {
    return this.airportRepository.find()
  }

  findOne(id: number) {
    return this.airportRepository.findOneBy({id})
  }

  update(id: number, updateAirportDto: UpdateAirportDto) {
    return this.airportRepository.update(id, updateAirportDto)
  }

  remove(id: number) {
    return this.airportRepository.delete(id)
  }

  /**
   * Get all active airports
   */
  async getAllActiveAirports(): Promise<AirportEntity[]> {
    return this.airportRepository.find({
      where: { isActive: true },
      order: { airportName: 'ASC' }
    });
  }

  /**
   * Get airports by region
   */
  async getAirportsByRegion(region: string): Promise<AirportEntity[]> {
    return this.airportRepository.find({
      where: { region, isActive: true },
      order: { airportName: 'ASC' }
    });
  }

  /**
   * Get airports by country
   */
  async getAirportsByCountry(country: string): Promise<AirportEntity[]> {
    return this.airportRepository.find({
      where: { country, isActive: true },
      order: { airportName: 'ASC' }
    });
  }

  /**
   * Find airport by IATA code
   */
  async findAirportByIataCode(iataCode: string): Promise<AirportEntity | null> {
    return this.airportRepository.findOne({
      where: { iataCode: iataCode.toUpperCase(), isActive: true }
    });
  }

  /**
   * Search airports by name or city
   */
  async searchAirports(searchTerm: string): Promise<AirportEntity[]> {
    return this.airportRepository
      .createQueryBuilder('airport')
      .where('airport.isActive = :isActive', { isActive: true })
      .andWhere(
        '(airport.airportName ILIKE :searchTerm OR airport.city ILIKE :searchTerm OR airport.iataCode ILIKE :searchTerm)',
        { searchTerm: `%${searchTerm}%` }
      )
      .orderBy('airport.airportName', 'ASC')
      .getMany();
  }

  /**
   * Get all unique regions
   */
  async getAllRegions(): Promise<string[]> {
    const airports = await this.airportRepository.find({
      select: ['region'],
      where: { isActive: true }
    });
    
    return [...new Set(airports.map(airport => airport.region))].sort();
  }

  /**
   * Get all unique countries
   */
  async getAllCountries(): Promise<string[]> {
    const airports = await this.airportRepository.find({
      select: ['country'],
      where: { isActive: true }
    });
    
    return [...new Set(airports.map(airport => airport.country))].sort();
  }

 

  /**
   * Seeds airport data from the JSON file when the application starts
   * This ensures all airports are available for travel and demand creation
   */
  private async seedAirportData(): Promise<void> {
    try {
      // Check if airports already exist
      const existingAirports = await this.airportRepository.count();
      if (existingAirports > 0) {
        console.log(` ${existingAirports} airports already exist in database`);
        return;
      }

      // Read the airports JSON file using process.cwd()
      const airportsFilePath = path.join(process.cwd(), 'src', 'airport', 'data', 'airports.json');
      console.log(` Attempting to read file from: ${airportsFilePath}`);
      
      const airportsData = fs.readFileSync(airportsFilePath, 'utf8');
      const airports = JSON.parse(airportsData);

      console.log(`📊Found ${airports.length} airports in JSON file`);

      // Transform the data to match the entity structure
      const airportEntities = airports.map((airport: any) => {
        return this.airportRepository.create({
          airportName: airport.airportname,
          city: airport.location,
          country: airport.country,
          state: airport.state || null,
          iataCode: airport.iata_code,
          region: airport.region,
          isActive: true
        });
      });

      // Save all airports in batches to avoid memory issues
      const batchSize = 100;
      let savedCount = 0;

      for (let i = 0; i < airportEntities.length; i += batchSize) {
        const batch = airportEntities.slice(i, i + batchSize);
        await this.airportRepository.save(batch);
        savedCount += batch.length;
        console.log(`✈️ Saved batch ${Math.floor(i / batchSize) + 1}: ${savedCount}/${airports.length} airports`);
      }

      console.log(`🟢 Successfully seeded ${savedCount} airports`);
      
      // Get unique regions for display
      const uniqueRegions = [...new Set(airports.map((a: any) => a.region))];
      console.log(` Regions available: ${uniqueRegions.slice(0, 5).join(', ')}${uniqueRegions.length > 5 ? ` and ${uniqueRegions.length - 5} more...` : ''}`);

    } catch (error) {
      console.error(`🔴 Failed to seed airport data:`, error.message);
      
      if (error.code === 'ENOENT') {
        console.error(`💡 Make sure the airports.json file exists at: src/airport/data/airports.json`);
        console.error(` Current directory: ${process.cwd()}`);
      }
      
      if (error.code === 'ER_DUP_ENTRY') {
        console.log(`💡 Some airports might already exist. Continuing...`);
      }
      
      // Log the full error for debugging
      console.error(`🔍 Full error:`, error);
    }
  }
}
