import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import * as amqp from 'amqplib';
import { type SensorLogDocument } from './schemas/sensor-log.schema';

@Injectable()
export class TelemetryPublisherService
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(TelemetryPublisherService.name);

  private connection!: amqp.ChannelModel;
  private channel!: amqp.Channel;
  private readonly EXCHANGE_NAME = 'telemetry_exchange';

  constructor(private configService: ConfigService) {}

  // Restoring the missing lifecycle hooks
  async onModuleInit() {
    await this.connectToRabbitMQ();
  }

  async onModuleDestroy() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
  }

  private async connectToRabbitMQ() {
    // 1. Pull the separated credentials
    const user = this.configService.get<string>('RABBITMQ_USER');
    const pass = this.configService.get<string>('RABBITMQ_PASS');
    const host = this.configService.get<string>('RABBITMQ_HOST');
    const port = this.configService.get<string>('RABBITMQ_PORT');

    if (!user || !pass || !host || !port) {
      this.logger.error('CRITICAL: RabbitMQ credentials missing from .env');
      return;
    }

    // 2. Construct the connection string dynamically
    const rabbitUrl = `amqp://${user}:${pass}@${host}:${port}`;

    try {
      this.connection = await amqp.connect(rabbitUrl);
      this.channel = await this.connection.createChannel();

      await this.channel.assertExchange(this.EXCHANGE_NAME, 'topic', {
        durable: false,
      });

      this.logger.log('Connected to RabbitMQ for Telemetry Publishing');
    } catch (error) {
      this.logger.error('Failed to connect to RabbitMQ', error);
    }
  }

  /**
   * THE EVENT LISTENER: Catch the data saved by the TelemetryRepository.
   * (Restoring this fixes the unused OnEvent and SensorLogDocument errors!)
   */
  @OnEvent('CLEAN_TELEMETRY_SAVED')
  handleNewTelemetry(savedLog: SensorLogDocument) {
    if (!this.channel) return;

    const deviceIdString = savedLog.device_id.toString();

    // The routing key: device.12345
    // React can subscribe to `/exchange/telemetry_exchange/device.12345`
    const routingKey = `device.${deviceIdString}`;

    const payload = JSON.stringify(savedLog);

    this.channel.publish(this.EXCHANGE_NAME, routingKey, Buffer.from(payload));

    this.logger.debug(
      `[${savedLog.traceId}] Published to RabbitMQ on topic: ${routingKey}`,
    );
  }
}
