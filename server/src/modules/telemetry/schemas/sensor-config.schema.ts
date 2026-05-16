import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type SensorConfigDocument = HydratedDocument<SensorConfig>;

class ThresholdParams {
  @Prop({ required: true })
  min!: number;

  @Prop({ required: true })
  max!: number;

  @Prop({ required: true })
  enabled!: boolean;
}

@Schema({ timestamps: true })
export class SensorConfig {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Device',
    required: true,
    index: true,
  })
  device_id!: Types.ObjectId;

  @Prop({ type: ThresholdParams, required: true })
  temperature!: ThresholdParams;

  @Prop({ type: ThresholdParams, required: true })
  humidity!: ThresholdParams;

  @Prop({ type: ThresholdParams, required: true })
  soil_moisture!: ThresholdParams;

  @Prop({ type: ThresholdParams, required: true })
  light_level!: ThresholdParams;
}

export const SensorConfigSchema = SchemaFactory.createForClass(SensorConfig);
