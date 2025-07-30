import { Module } from '@nestjs/common';
import { TravelController } from './travel.controller';
import { TravelService } from './travel.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TravelEntity } from './travel.entity';

@Module({
  imports:[TypeOrmModule.forFeature([TravelEntity])],
  controllers: [TravelController],
  providers: [TravelService],
exports:[TravelService]
})
export class TravelModule {}
