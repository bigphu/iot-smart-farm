import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import {
  SensorType,
  AlertStatus,
  AlertType,
} from '../../../common/enums/smart-farm.enums';

export type AlertLogDocument = HydratedDocument<AlertLog>;

@Schema()
export class AlertLog {
  @Prop({ required: true, index: true })
  traceId!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Device', required: true })
  device_id!: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'SensorLog',
    required: true,
  })
  sensor_log_id!: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, enum: SensorType })
  sensor_type!: string;

  @Prop({ required: true })
  value!: number;

  @Prop({ required: true, enum: AlertStatus })
  status!: string;

  @Prop({ required: true })
  message!: string;

  @Prop({ required: true, enum: AlertType })
  type!: string;

  @Prop({ required: true })
  is_resolved!: boolean;

  @Prop({ required: true })
  timestamp!: Date;
}

export const AlertLogSchema = SchemaFactory.createForClass(AlertLog);
