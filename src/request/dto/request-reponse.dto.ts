import { ApiProperty } from "@nestjs/swagger";
import { DemandResponseDto } from "src/demand/dto/demand-response.dto";
import { MessageResponseDto } from "src/message/dto/message-response.dto";
import { RequestStatusResponseDto } from "src/request-status/dto/requestStatusResponse.dto";
import { UserResponseDto } from "src/user/dto/user-response.dto";

export class RequestResponseDto {
    @ApiProperty({ example: 1 })
  demandId: number | null;

  @ApiProperty({ example: 1 })
  travelId: number | null;

  @ApiProperty({ example: 1 })
  requesterId: number; 

  @ApiProperty({ example: 'GoAndGo' })
  requestType: 'GoAndGive' | 'GoAndGo';

  @ApiProperty({ example: 100 })
  offerPrice: number;

  @ApiProperty({ example: 'I need to send a package from New York to London' })
  packageDescription?: string|null;

  @ApiProperty({ example: 100 })
  weight: number|null;

  @ApiProperty({ example: 1 })
  currentStatusId: number;

  @ApiProperty({ example: 1 })
  createdBy: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: Date;


  @ApiProperty({ example: 1 })
  status: string;

  @ApiProperty({ example: 1 })
  requester: UserResponseDto;

  @ApiProperty({ example: 1 })
  demand: DemandResponseDto;

  @ApiProperty({ example: 1 })
  message: MessageResponseDto;

  @ApiProperty({ example: 1 })
  requestStatus: RequestStatusResponseDto;
}

export class CreateRequestResponseDto {
    @ApiProperty({ example: 'Request created successfully' })
    message: string;
    @ApiProperty({ example: RequestResponseDto })
    request: RequestResponseDto;
}