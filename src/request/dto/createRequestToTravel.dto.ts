import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateRequestToTravelDto {

  @IsNotEmpty()
  @IsNumber()
  travelId: number;

  @IsNotEmpty()
  requestType: 'GoAndGive' | 'GoAndGo';

  @IsNumber()
  @IsNotEmpty()
  offerPrice: number;

  @IsNotEmpty()
  @IsString()
  packageDescription: string;

  @IsNumber()
  @IsNotEmpty()
  weight: number;
}
