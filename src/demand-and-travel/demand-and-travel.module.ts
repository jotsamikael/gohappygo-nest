import { Module } from '@nestjs/common';
import { DemandAndTravelController } from './demand-and-travel.controller';
import { DemandModule } from 'src/demand/demand.module';
import { TravelModule } from 'src/travel/travel.module';
import { AirportModule } from 'src/airport/airport.module';
import { DemandAndTravelService } from './demand-and-travel.service';

@Module({
  controllers: [DemandAndTravelController],
  imports:[DemandModule, TravelModule, AirportModule],
  providers:[DemandAndTravelService],
  exports:[DemandAndTravelService]
})
export class DemandAndTravelModule {}
