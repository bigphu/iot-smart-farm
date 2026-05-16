import { Module } from '@nestjs/common';
import { DataCleanerService } from './data-cleaner.service';
import { TelemetryRepository } from './telemetry.repository';
import { TelemetryPublisherService } from './telemetry-publisher.service';

@Module({
  providers: [
    DataCleanerService,
    TelemetryRepository,
    TelemetryPublisherService,
  ],
})
export class TelemetryModule {}
