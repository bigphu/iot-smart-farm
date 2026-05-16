import { IsString, IsNumber, IsNotEmpty, IsDateString } from 'class-validator';

export class IncomingTelemetryDto {
  @IsString()
  @IsNotEmpty()
  traceId!: string;

  @IsString()
  @IsNotEmpty()
  device_id!: string;

  @IsDateString()
  timestamp!: string;

  @IsNumber()
  temperature!: number;

  @IsNumber()
  humidity!: number;

  @IsNumber()
  soil_moisture!: number;

  @IsNumber()
  light_level!: number;
}
