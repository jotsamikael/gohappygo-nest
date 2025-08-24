import { Module } from '@nestjs/common';
import { AirlineService } from './airline.service';
import { AirlineController } from './airline.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AirlineEntity } from './entities/airline.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { FlightEntity } from 'src/flight/entities/flight.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AirlineEntity, FlightEntity]),
  CacheModule.register()],
  controllers: [AirlineController],
  providers: [AirlineService],
})
export class AirlineModule {}
