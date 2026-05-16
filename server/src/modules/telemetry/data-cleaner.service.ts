import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { TelemetryRepository } from './telemetry.repository';
import { IncomingTelemetryDto } from './dto/telemetry.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class DataCleanerService {
  private readonly logger = new Logger(DataCleanerService.name);
  constructor(private readonly telemetryRepository: TelemetryRepository) {}

  @OnEvent('RAW_MQTT_RECEIVED')
  async handleRawData(rawPayload: Record<string, unknown>) {
    this.logger.log('Cleaning raw MQTT data...');

    const traceId: string =
      (rawPayload.traceId as string) || 'unknown-trace-id';
    this.logger.debug(`Processing traceId: ${traceId}`);

    const telemetryDto = plainToInstance(IncomingTelemetryDto, rawPayload);
    const error = await validate(telemetryDto);

    if (error.length > 0) {
      this.logger.error(`[${traceId}] Invalid telemetry payload: `, error);
      return;
    }

    try {
      this.logger.debug(
        `[${traceId}] Data validated successfully. Handing off to Repository...`,
      );

      await this.telemetryRepository.saveCleanTelemetry(telemetryDto);
    } catch (error) {
      this.logger.error(
        `[${traceId}] Failed to save cleaned telemetry data: `,
        error,
      );
    }
  }
}
