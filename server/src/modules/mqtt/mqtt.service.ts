import {
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import * as mqtt from 'mqtt';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MqttService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MqttService.name);
  private client!: mqtt.MqttClient;

  // Dynamically constructed topics
  private sensorTopic!: string;
  private pumpTopic!: string;

  constructor(
    private configService: ConfigService,
    private eventEmitter: EventEmitter2,
  ) {}

  onModuleInit() {
    this.connectToBroker();
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.end();
      this.logger.log('Disconnected from Adafruit IO MQTT Broker');
    }
  }

  private connectToBroker() {
    // Load credentials from .env
    const username = this.configService.get<string>('ADAFRUIT_AIO_USERNAME');
    const key = this.configService.get<string>('ADAFRUIT_AIO_KEY');

    if (!username || !key) {
      this.logger.error(
        'CRITICAL: Adafruit IO credentials missing from .env file. MQTT Client offline.',
      );
      return;
    }

    // Construct Adafruit IO standard topics
    this.sensorTopic = `${username}/feeds/sensors`;
    this.pumpTopic = `${username}/feeds/command`;

    // Adafruit IO requires port 8883 for secure MQTTS connections
    const brokerUrl = `mqtts://${username}:${key}@io.adafruit.com`;

    this.client = mqtt.connect(brokerUrl, {
      port: 8883,
      reconnectPeriod: 5000, // Try to reconnect every 5 seconds if the connection drops
      clientId: `fernlidae_backend_${Math.random().toString(16).substring(2, 8)}`,
    });

    // --- CONNECTION EVENTS ---
    this.client.on('connect', () => {
      this.logger.log('Successfully connected to Adafruit IO');

      this.client.subscribe(this.sensorTopic, (err) => {
        if (err) {
          this.logger.error(`Failed to subscribe to ${this.sensorTopic}`, err);
        } else {
          this.logger.log(`Listening for telemetry on: ${this.sensorTopic}`);
        }
      });
    });

    this.client.on('error', (error) => {
      this.logger.error('MQTT Connection Error', error);
    });

    this.client.on('offline', () => {
      this.logger.warn('MQTT Client went offline. Attempting to reconnect...');
    });

    // --- MESSAGE INGRESS (The Ears) ---
    this.client.on('message', (topic, message) => {
      if (topic === this.sensorTopic) {
        this.handleIncomingTelemetry(message.toString());
      }
    });
  }

  private handleIncomingTelemetry(rawPayload: string) {
    // FAULT PROTECTION: Assign a unique UUID the exact millisecond data arrives.
    // This allows us to track this specific payload through the Cleaner, DB, and UI.
    const traceId: string = uuidv4();
    this.logger.debug(`[${traceId}] Raw telemetry received from ESP32`);

    try {
      const parsedData = JSON.parse(rawPayload) as Record<string, unknown>;

      // Hand the raw data off to the internal Event Bus.
      // The DataCleanerService will catch this event.
      this.eventEmitter.emit('RAW_MQTT_RECEIVED', {
        traceId,
        ...parsedData,
      });
    } catch (error: unknown) {
      this.logger.error(
        `[${traceId}] Dropping payload: Invalid JSON format from hardware. Payload: ${rawPayload}. Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  // --- MESSAGE EGRESS (The Mouth) ---
  // The Control Module emits this event when the Rule Engine or User decides to water the farm.
  @OnEvent('PUMP_CMD_DISPATCHED')
  handlePumpCommand(payload: { traceId: string; command: string }) {
    if (!this.client || !this.client.connected) {
      this.logger.error(
        `[${payload.traceId}] Cannot send pump command: MQTT client is disconnected.`,
      );
      return;
    }

    this.logger.log(
      `[${payload.traceId}] Dispatching command to ESP32: ${payload.command}`,
    );

    // Publish the command (e.g., "ON_120" for 120 seconds) to Adafruit IO
    this.client.publish(
      this.pumpTopic,
      payload.command,
      { qos: 1 },
      (error) => {
        if (error) {
          this.logger.error(
            `[${payload.traceId}] Failed to publish pump command`,
            error,
          );
        }
      },
    );
  }
}
