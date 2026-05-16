import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type SensorLogDocument = HydratedDocument<SensorLog>;

@Schema({ timestamps: true })
export class SensorLog {
  // FAULT PROTECTION: Traceability. Links this log to resulting alerts/pump actions.
  @Prop({ required: true, index: true })
  traceId!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Device', required: true })
  device_id!: Types.ObjectId;

  @Prop({ required: true })
  timestamp!: Date;

  @Prop({ required: true })
  temperature!: number;

  @Prop({ required: true })
  humidity!: number;

  @Prop({ required: true })
  soil_moisture!: number;

  @Prop({ required: true })
  light_level!: number;
}

export const SensorLogSchema = SchemaFactory.createForClass(SensorLog);
SensorLogSchema.index({ device_id: 1, timestamp: 1 }, { unique: true });
