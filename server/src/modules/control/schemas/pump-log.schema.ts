import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import {
  TriggerSource,
  PumpActionStatus,
} from '../../../common/enums/smart-farm.enums';

export type PumpLogDocument = HydratedDocument<PumpLog>;

@Schema()
export class PumpLog {
  @Prop({ required: true, index: true })
  traceId!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Device', required: true })
  device_id!: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'SensorLog',
    required: false,
  })
  sensor_log_id?: MongooseSchema.Types.ObjectId; // Optional, as MANUAL triggers won't have this

  @Prop({ required: true, enum: TriggerSource })
  trigger_source!: string;

  @Prop({ required: true, enum: PumpActionStatus })
  status!: string;

  @Prop({ required: true })
  duration!: number;

  @Prop({ required: true })
  timestamp!: Date;
}

export const PumpLogSchema = SchemaFactory.createForClass(PumpLog);
